
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <fcntl.h>
#include <sched.h>
#include <sys/mount.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/syscall.h>
#include <signal.h>

#define STACK_SIZE (1024 * 1024) /* Stack size for cloned child */
#define MAX_PATH 4096

// Container configuration
typedef struct {
    char hostname[256];
    char rootfs[MAX_PATH];
    char command[MAX_PATH];
    char **command_args;
    int command_argc;
    char *cgroup_path;
    int cpu_shares;
    int memory_limit_mb;
} container_config;

static char child_stack[STACK_SIZE]; /* Stack for child */

// Setup the hostname for the container
int setup_hostname(const char *hostname) {
    if (sethostname(hostname, strlen(hostname)) == -1) {
        perror("sethostname");
        return -1;
    }
    return 0;
}

// Setup the root filesystem for the container
int setup_root(const char *rootfs) {
    // Change to the new root directory
    if (chdir(rootfs) == -1) {
        perror("chdir");
        return -1;
    }
    
    // Call chroot to change the root filesystem
    if (chroot(".") == -1) {
        perror("chroot");
        return -1;
    }
    
    // Set the working directory to root
    if (chdir("/") == -1) {
        perror("chdir");
        return -1;
    }
    
    return 0;
}

// Setup mounts for the container
int setup_mounts() {
    // Mount proc filesystem
    if (mount("proc", "/proc", "proc", 0, NULL) == -1) {
        perror("mount proc");
        return -1;
    }
    
    // Mount sysfs
    if (mount("sysfs", "/sys", "sysfs", 0, NULL) == -1) {
        perror("mount sysfs");
        return -1;
    }
    
    return 0;
}

// Setup cgroups for resource limiting
int setup_cgroups(container_config *config) {
    if (!config->cgroup_path) {
        return 0; // No cgroup configuration
    }
    
    char cpu_path[MAX_PATH];
    char mem_path[MAX_PATH];
    char pid_str[32];
    FILE *fp;
    
    // Get current PID
    pid_t pid = getpid();
    sprintf(pid_str, "%d", pid);
    
    // Setup CPU limits
    if (config->cpu_shares > 0) {
        snprintf(cpu_path, MAX_PATH, "%s/cpu/tasks", config->cgroup_path);
        fp = fopen(cpu_path, "w");
        if (!fp) {
            perror("Failed to open CPU cgroup tasks");
            return -1;
        }
        fprintf(fp, "%s", pid_str);
        fclose(fp);
        
        snprintf(cpu_path, MAX_PATH, "%s/cpu/cpu.shares", config->cgroup_path);
        fp = fopen(cpu_path, "w");
        if (!fp) {
            perror("Failed to open CPU shares");
            return -1;
        }
        fprintf(fp, "%d", config->cpu_shares);
        fclose(fp);
    }
    
    // Setup Memory limits
    if (config->memory_limit_mb > 0) {
        snprintf(mem_path, MAX_PATH, "%s/memory/tasks", config->cgroup_path);
        fp = fopen(mem_path, "w");
        if (!fp) {
            perror("Failed to open memory cgroup tasks");
            return -1;
        }
        fprintf(fp, "%s", pid_str);
        fclose(fp);
        
        snprintf(mem_path, MAX_PATH, "%s/memory/memory.limit_in_bytes", config->cgroup_path);
        fp = fopen(mem_path, "w");
        if (!fp) {
            perror("Failed to open memory limit");
            return -1;
        }
        fprintf(fp, "%llu", (unsigned long long)config->memory_limit_mb * 1024 * 1024);
        fclose(fp);
    }
    
    return 0;
}

// Child function that runs inside the container
int container_main(void *arg) {
    container_config *config = (container_config *)arg;
    
    // Setup hostname
    if (setup_hostname(config->hostname) != 0) {
        fprintf(stderr, "Failed to setup hostname\n");
        return 1;
    }
    
    // Setup rootfs
    if (setup_root(config->rootfs) != 0) {
        fprintf(stderr, "Failed to setup rootfs\n");
        return 1;
    }
    
    // Setup mounts
    if (setup_mounts() != 0) {
        fprintf(stderr, "Failed to setup mounts\n");
        return 1;
    }
    
    // Setup cgroups for resource limiting
    if (setup_cgroups(config) != 0) {
        fprintf(stderr, "Failed to setup cgroups\n");
        return 1;
    }
    
    // Execute the command
    execvp(config->command, config->command_args);
    
    // If we're here, execvp failed
    perror("execvp");
    return 1;
}

// Create and run a container
int run_container(container_config *config) {
    printf("Starting container with hostname: %s, rootfs: %s\n", 
           config->hostname, config->rootfs);
    
    // Clone a new process with namespace isolation
    int clone_flags = CLONE_NEWPID | CLONE_NEWUTS | CLONE_NEWNS | CLONE_NEWNET;
    pid_t pid = clone(container_main, 
                    child_stack + STACK_SIZE, 
                    clone_flags | SIGCHLD, 
                    config);
    
    if (pid == -1) {
        perror("clone");
        return 1;
    }
    
    printf("Container started with PID: %d\n", pid);
    
    // Wait for the container to exit
    int status;
    if (waitpid(pid, &status, 0) == -1) {
        perror("waitpid");
        return 1;
    }
    
    if (WIFEXITED(status)) {
        printf("Container exited with status: %d\n", WEXITSTATUS(status));
    } else if (WIFSIGNALED(status)) {
        printf("Container terminated by signal: %d\n", WTERMSIG(status));
    }
    
    return 0;
}

// This is just a simple example entry point
// In practice, you'd build this into a library and expose APIs
int main(int argc, char *argv[]) {
    if (argc < 3) {
        fprintf(stderr, "Usage: %s <rootfs_path> <command> [args...]\n", argv[0]);
        return 1;
    }
    
    container_config config;
    
    // Set the hostname
    gethostname(config.hostname, sizeof(config.hostname));
    strncat(config.hostname, "-container", sizeof(config.hostname) - strlen(config.hostname) - 1);
    
    // Set the root filesystem
    strncpy(config.rootfs, argv[1], sizeof(config.rootfs) - 1);
    
    // Set the command and arguments
    strncpy(config.command, argv[2], sizeof(config.command) - 1);
    config.command_args = &argv[2];
    config.command_argc = argc - 2;
    
    // Example cgroup setup (in real usage, create these directories first)
    config.cgroup_path = "/sys/fs/cgroup";
    config.cpu_shares = 1024; // Default value
    config.memory_limit_mb = 512; // 512MB limit
    
    return run_container(&config);
}
