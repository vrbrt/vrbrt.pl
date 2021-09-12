import './App.css';
import Header from './components/header/Header';
import Articles from "./pages/Articles";
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';

function App() {
  return (
    <div className="wrapper">
      <Router>
        <Header/>
        <Switch>
          <Route path="/java">
            <Articles tag="java"/>
          </Route>
          <Route path="/react">
            <Articles tag="react"/>
          </Route>
          <Route path="/k8s">
            <Articles tag="k8s"/>
          </Route>
          <Route path="/">
            <Articles/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;