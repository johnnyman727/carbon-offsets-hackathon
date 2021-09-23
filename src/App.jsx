import { BrowserRouter, Switch, Route } from 'react-router-dom';
import SplashPage from './components/SplashPage.jsx';
import ConnectUtilityAccount from './components/ConnectUtilityAccount.jsx';
import SelectCarbonOffsetProject from './components/SelectCarbonOffsetProject.jsx';

const App = () => (
  <BrowserRouter>
    <Switch>
        <Route exact path="/" component={SplashPage} />
        <Route exact path="/connect" component={ConnectUtilityAccount} />
        <Route exact path="/select" component={SelectCarbonOffsetProject} />
    </Switch>
  </BrowserRouter>
);

export default App;