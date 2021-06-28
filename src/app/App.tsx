import "./App.css";

import { CalendarScreen } from "./CalendarScreen";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/calendar/:month">
          <CalendarScreen />
        </Route>
        <Redirect to={{ pathname: "/calendar/" }} />
      </Switch>
    </Router>
  );
}
export default App;
