import UtilityConnectWidget from './utility-connect-widget.jsx';
import { Row, Col } from 'react-bootstrap';


const ConnectUtilityAccount = () => {
    return (
        <div className="container">
            <Row>
                <Col xs={12} sm={6} className="text-center">
                    <UtilityConnectWidget />
                </Col>
            </Row>
        </div>
    );
}

export default ConnectUtilityAccount;
