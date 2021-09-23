import UtilityConnectWidget from './utility-connect-widget.jsx';
import { Row, Col, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import OffsetGlyph from '../img/offset.png';


const SplashPage = () => {
    const history = useHistory();

    return (
        <div className="container">
            <Row className="justify-content-md-center">
                <Col xs={12} sm={5} className="text-center">
                    <img src={OffsetGlyph} alt="Offset" className="rounded mt-4" style={{width:"48px", height:"48px"}}/>
                    <h1 className="my-4">Welcome to Offset</h1>
                    <p className="my-4">Connect your utility so we can calculate the carbon emissions from your home energy usage and and offset them to get you to net zero emissions.</p>
                    <div className="d-grid my-4">
                        <Button variant="dark" size="lg" onClick={() => history.push('/connect')}>Connect your utility</Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default SplashPage;
