//
// Created by sheverdin on 10/4/23.
//

#include "parsing.h"
#include "dm_mainHeader.h"

#define DEVICE_TYPE_LEN (15)

const char modelTable[MAX_DEVICE_TYPE][DEVICE_TYPE_LEN] =
{
    {" "}, {"PSW-2G"}, {"PSW-2G-UPS"}, {"PSW-2G+"}, {"PSW-1G4F"},
    {"PSW-2G4F"}, {"PSW-2G6F+"}, {"PSW-2G8F+"}, {"PSW-1G4F-UPS"}, {"PSW-2G4F-UPS"},
    {"PSW-2G+UPS-Box"}
};

int split_line(char *line, const char* delim, splited_line_t *splitedLine)
{
    int bufsize = DM_TOK_BUFSIZE;
    splitedLine->tokens = malloc(bufsize * sizeof(char*));
    splitedLine->splitLineMax = 0;
    char *token;

    if (!splitedLine->tokens)
    {
        fprintf(stderr, "memory error 1\n");
        return EXIT_FAILURE;
    }

    token = strtok(line, delim);

    while (token != NULL)
    {
        splitedLine->tokens[splitedLine->splitLineMax] = token;
        splitedLine->splitLineMax++;

        if (splitedLine->splitLineMax >= bufsize)
        {
            bufsize += DM_TOK_BUFSIZE;
            splitedLine->tokens = realloc(splitedLine->tokens, bufsize * sizeof(char*));
            if (!splitedLine->tokens)
            {
                fprintf(stderr, "memory error 2\n");
                return EXIT_FAILURE;
            }
        }
        token = strtok(NULL, delim);
    }
    splitedLine->tokens[splitedLine->splitLineMax] = NULL;
    splitedLine->splitLineMax--;
    return EXIT_SUCCESS;
}

void replaceSymbols(char *str, char oldSym, char newSym)
{
    for (int i = 0; str[i] != '\0'; i++)
    {
        if (str[i] == oldSym)
        {
            str[i] = newSym;
        }
    }
}

void getDeviceType(search_out_msg_t *searchOutMsg, char *modelType)
{

    uint8_t deviceTypeFlag = 0;
    for (int i = 0; i < MAX_DEVICE_TYPE; i++)
    {
        if (strcmp(modelType, modelTable[i]) == 0)
        {
            deviceTypeFlag = 1;
            searchOutMsg->struct1.dev_type = i;
            i = MAX_DEVICE_TYPE;
        }
    }
    if(!deviceTypeFlag)
    {
        openlog("dm_err", LOG_PID, LOG_USER);
        syslog(LOG_ERR, "Device Type not Found");
        closelog();
    }
}

void extractValue(const char* str, char *extractedStr)
{
    size_t len = strlen((char*)str);
    int start = -1;
    int end = -1;

    for (int i = 0; i < len; i++)
    {
        if (str[i] == '[')
        {
            start = i + 1;
        }
        else if (str[i] == ']')
        {
            end = i;
            break;
        }
    }

    if (start != -1 && end != -1 && end > start)
    {
        extractedStr[SETTINGS_VALUE_LENGTH];
        strncpy((char*)extractedStr, (char*)&str[start], end - start);
        extractedStr[end - start] = '\0';
    }
}

void removeCharacter(char *str, char removeChar)
{
    int length = strlen(str);
    int currentIndex = 0;

    for (int i = 0; i < (length); i++)
    {
        if (str[i] != removeChar)
        {
            str[currentIndex] = str[i];
            currentIndex++;
        }
    }
    str[currentIndex] = '\0';
}
