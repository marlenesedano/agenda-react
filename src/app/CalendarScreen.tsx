import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import Avatar from "@material-ui/core/Avatar";
import {
  getEventsEndpoint,
  getCalendarsEndpoint,
  IEvent,
  ICalendar,
} from "../backend";
import { useEffect, useState } from "react";

const daysOfWeek = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

const useStyles = makeStyles({
  table: {
    borderTop: "1px solid rgb(224, 224, 224)",
    minHeight: "100%",
    tableLayout: "fixed",
    "& td ~ td,& th ~ th": {
      borderLeft: "1px solid rgb(224, 224, 224)",
    },
    "& td": {
      verticalAlign: "top",
      overflow: "hidden",
      padding: "8px 4px",
    },
  },
  dayOfMonth: {
    fontWeight: 500,
    marginBottom: "4px",
  },
  event: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    whiteSpace: "nowrap",
    margin: "4px 0",
  },
  eventBackground: {
    display: "inline-block",
    color: "white",
    padding: "2px 4px",
    borderRadios: "4px",
  },
});

export function CalendarScreen() {
  const classes = useStyles();
  const [calendars, setCalendars] = useState<ICalendar[]>([]);
  const [calendarsSelected, setCalendarsSelected] = useState<boolean[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const weeks = generateCalendar(
    getToday(),
    events,
    calendars,
    calendarsSelected
  );
  const firstDate = weeks[0][0].date;
  const lastDate = weeks[weeks.length - 1][6].date;

  useEffect(() => {
    Promise.all([
      getCalendarsEndpoint(),
      getEventsEndpoint(firstDate, lastDate),
    ]).then(([calendars, events]) => {
      console.log("teste", calendars);
      setCalendarsSelected(calendars.map(() => true));
      setCalendars(calendars);
      setEvents(events);
    });
  }, [firstDate, lastDate]);

  function toggleCalendar(i: number) {
    const newValue = [...calendarsSelected];
    newValue[i] = !newValue[i];
    setCalendarsSelected(newValue);
  }

  return (
    <Box display="flex" height="100%" alignItems="stretch">
      <Box
        borderRight="1px solid rgb(224, 224, 224)"
        width="16em"
        padding="8px 16px"
      >
        <h2>Agenda React</h2>

        <Button variant="contained" color="primary">
          Novo Evento
        </Button>

        <Box marginTop="64px">
          <h3>Agendas</h3>
          {calendars.map((calendar, i) => (
            <FormControlLabel
              key={calendar.id}
              control={
                <Checkbox
                  style={{ color: calendar.color }}
                  checked={calendarsSelected[i]}
                  onChange={() => toggleCalendar(i)}
                />
              }
              label={calendar.name}
            />
          ))}
        </Box>
      </Box>

      <Box flex="1" display="block" flex-direction="column">
        <Box display="flex" alignItems="center" padding="8px 16px">
          <Box>
            <IconButton aria-label="Mês anterior">
              <Icon>chevron_left</Icon>
            </IconButton>
            <IconButton aria-label="Próximo mês">
              <Icon>chevron_right</Icon>
            </IconButton>
          </Box>
          <Box flex="1" marginLeft="13px" component="h3">
            Junho de 2021
          </Box>
          <IconButton aria-label="Usuario">
            <Avatar>
              <Icon>person</Icon>
            </Avatar>
          </IconButton>
        </Box>
        <TableContainer style={{ flex: "1" }} component={"div"}>
          <Table
            className={classes.table}
            size="small"
            aria-label="a dense table"
          >
            <TableHead>
              <TableRow>
                {daysOfWeek.map((day) => (
                  <TableCell align="center" key={day}>
                    {day}{" "}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, i) => (
                <TableRow key={i}>
                  {week.map((cell) => (
                    <TableCell align="center" key={cell.date}>
                      <div className={classes.dayOfMonth}>
                        {cell.dayOfMonth}
                      </div>

                      {cell.events.map((event) => {
                        const color = event.calendar.color;

                        return (
                          <button key={event.id} className={classes.event}>
                            {event.time && (
                              <>
                                <Icon style={{ color }} fontSize="inherit">
                                  watch_later
                                </Icon>
                                <Box component="span" margin="0 4px">
                                  {event.time}
                                </Box>
                              </>
                            )}
                            {event.time ? (
                              <span>{event.desc}</span>
                            ) : (
                              <span
                                className={classes.eventBackground}
                                style={{ backgroundColor: color }}
                              >
                                {event.desc}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

type IEventWithCalendar = IEvent & { calendar: ICalendar };

interface ICalendarCell {
  date: string;
  dayOfMonth: number;
  events: IEventWithCalendar[];
}

function generateCalendar(
  date: string,
  allEvents: IEvent[],
  calendars: ICalendar[],
  calendarsSelected: boolean[]
): ICalendarCell[][] {
  const weeks: ICalendarCell[][] = [];
  const jsDate = new Date(date + "T12:00:00");
  const currentMonth = jsDate.getMonth();
  const currentDay = new Date(jsDate.valueOf());
  currentDay.setDate(1);
  const dayOfWeek = currentDay.getDay();
  currentDay.setDate(1 - dayOfWeek);

  do {
    const week: ICalendarCell[] = [];
    for (let i = 0; i < daysOfWeek.length; i++) {
      const monthStr = (currentDay.getMonth() + 1).toString().padStart(2, "0");
      const dayStr = currentDay.getDate().toString().padStart(2, "0");
      const isoDate = `${currentDay.getFullYear()}-${monthStr}-${dayStr}`;

      const events: IEventWithCalendar[] = [];

      for (const event of allEvents) {
        if (event.date === isoDate) {
          const calIndex = calendars.findIndex(
            (cal) => cal.id === event.calendarId
          );
          if (calendarsSelected[calIndex]) {
            events.push({ ...event, calendar: calendars[calIndex] });
          }
        }
      }

      week.push({
        dayOfMonth: currentDay.getDate(),
        date: isoDate,
        events,
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }
    weeks.push(week);
  } while (currentDay.getMonth() === currentMonth);

  return weeks;
}

function getToday() {
  return "2021-06-17";
}
