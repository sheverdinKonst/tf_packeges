#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <string.h>
#include <sys/types.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <sys/poll.h>
#include <sys/un.h>
#include <linux/i2c.h>
#include <linux/i2c-dev.h>
#include <netinet/in.h>
#include <unistd.h>
#include <errno.h> 
#include <gpiod.h>

#include "registers.h"
#include <stdbool.h>
#include <syslog.h>



#define errcheck(rc, funcName) \
	if (rc == -1) { perror(funcName); return EXIT_FAILURE; }

#define IF_CMP(x) if(strcmp(x,name)==0)

int get_line_by_name(char *name);
/*usage
 *
 * argv[1] - line Name:
 * SYS_LED
 * SYS_RESET
 * IOMCU_RESET
 * POE_RESET
 * BOOT0
 *
 * argv[2] - operation code
 *GET - get gpio state
 *SET - set gpio output state
 *RESET - send 1000ms reverse impulse
 *
 *argv[3] (if opcode == SET)
 *VALUE (1/0)
 *
 *Example1: ./gpio_ctrl SYS_RESET RESET
 *Example2: ./gpio_ctrl SYS_LED SET 0
 *Example3: ./gpio_ctrl SYS_LED GET
*/

int main(int argc, char **argv) {

	struct gpiod_chip *chip;
	struct gpiod_line *line;
    struct gpiod_chip_info *gpioChipInfo;
    struct gpiod_line_info *gpioLineInfo;

    const char *chipName;
    const char *chipLabel;
    size_t chipNumLines;
    bool isChip;

    unsigned int lineOffset;
    const char * lineName;
    const char * lineConsumer;
    int lineDirection;
    int lineActiveState;
    int lineValue;
    bool lineIsUsed;
    bool lineOpenSource;

    int line_id;
    int value,req;


// *************************** CHIP *********************************

	chip = gpiod_chip_open("/dev/gpiochip0");

    if (!chip){
        openlog("gpio_ctrl", LOG_PID, LOG_USER);
        syslog(LOG_ERR, "ERROR gpiod_chip_open" );
        closelog();
        return -1;
    }

// *************************** LINE *********************************
    line_id = get_line_by_name(argv[1]);
    //printf("line id = %d\n", line_id);
    if(line_id == -1){
        openlog("gpio_ctrl", LOG_PID, LOG_USER);
        syslog(LOG_ERR, "ERROR incorrect line Name");
        closelog();
        return -1;
    }

	line = gpiod_chip_get_line(chip, line_id);
	if (!line) {
        openlog("gpio_ctrl", LOG_PID, LOG_USER);
        syslog(LOG_ERR, "ERROR gpiod_chip_get_line %d\n", line_id);
        closelog();
		gpiod_chip_close(chip);
		return -1;
	}

    if(argc < 3)
    {
        return -1;
    }



	//GET opcode
	if(strcmp(argv[2],"GET")==0){
        value = gpiod_line_get_value(line);
		req = gpiod_line_request_input(line, "gpio");
		if (req) {
            openlog("gpio_ctrl", LOG_PID, LOG_USER);
            syslog(LOG_ERR, "ERROR gpiod_line_request_input %d\n",line_id);
            closelog();
			gpiod_chip_close(chip);
			return -1;
		}
		value = gpiod_line_get_value(line);
        req = gpiod_line_request_output(line, "gpio", value);
	}
	else if(strcmp(argv[2],"SET")==0){
		if(argc < 4)
			return -1;

		req = gpiod_line_request_output(line, "gpio",0);
		if (req) {
            openlog("gpio_ctrl", LOG_PID, LOG_USER);
            syslog(LOG_ERR, "ERROR gpiod_line_request_output %d\n",line_id);
            closelog();
			gpiod_chip_close(chip);
			return -1;
		}

		value = strtoul(argv[3],NULL,10);
		gpiod_line_set_value(line, value);
	}
	else if(strcmp(argv[2],"RESET")==0){
		req = gpiod_line_request_output(line, "gpio",0);
		if (req) {
            openlog("gpio_ctrl", LOG_PID, LOG_USER);
            syslog(LOG_ERR, "ERROR gpiod_line_request_output %d\n",line_id);
            closelog();
			gpiod_chip_close(chip);
			return -1;
		}

		gpiod_line_set_value(line,0);
		sleep(1);
		gpiod_line_set_value(line,1);
	}
	else{
        openlog("gpio_ctrl", LOG_PID, LOG_USER);
        syslog(LOG_ERR, "ERROR: unknown command %s\n",argv[2]);
        closelog();
		gpiod_chip_close(chip);
		return -1;
	}
	gpiod_chip_close(chip);
	return 0;
}

int get_line_by_name(char *name){
	IF_CMP("SYS_LED") return RTL_GPIO_SYS_LED;
	IF_CMP("SYS_RESET") return RTL_GPIO_SYS_RESET;
	IF_CMP("IOMCU_RESET") return RTL_GPIO_IOMCU_RESET;
	IF_CMP("POE_RESET") return RTL_GPIO_POE_RESET;
	IF_CMP("BOOT0") return RTL_GPIO_BOOT0;
	return -1;
}

