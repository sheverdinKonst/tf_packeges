cmake_minimum_required(VERSION 2.6)

PROJECT(syslog_fc C)
INCLUDE(GNUInstallDirs)
SET(SYSLOG_FC_VERSION 0.9.5)

ADD_DEFINITIONS(-Os -Wall -Werror --std=gnu99)
#ADD_DEFINITIONS(-Os -ggdb -Wextra -Wall -Werror --std=gnu99 -Wmissing-declarations -Wno-unused-parameter)

ADD_DEFINITIONS(-DSYSLOG_FC_VERSION="${SYSLOG_FC_VERSION}")

INCLUDE_DIRECTORIES(
	src
	src/formats

)

ADD_EXECUTABLE(syslog_fc
	src/main.c
	src/syslog_entry.c
	src/formats/fmt_plain.c
	src/formats/fmt_md.c
	src/formats/fmt_csv.c
	src/formats/fmt_json.c
	src/formats/fmt_html.c
	src/formats/fmt_asciidoc.c
)

INSTALL(TARGETS syslog_fc RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR})
