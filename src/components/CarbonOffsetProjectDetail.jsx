import React, {useState, useEffect} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import {Row, Col, Card, Button} from 'react-bootstrap';
import { useInterval } from '../utils/useInterval';
import './CarbonOffsetProjectDetail.scss'

const buyProject= (projectId, price) => {
    const response = fetch(`http://localhost:3000/purchase_project?project_id=${projectId}&total_price_cents_usd=${price}`);
    return;
};

const CarbonOffsetProjectDetail = () => {
    const [utilityName, setUtilityName] = useState('Loading...');
    const [projectImageURL, setProjectImageURL] = useState(null);
    const [projectId, setProjectId] = useState(null);
    const [projectName, setProjectName] = useState('Loading...');
    const [projectLocation, setProjectLocation] = useState('Loading...')
    const [projectPrice, setProjectPrice] = useState(0);
    const [projectDescription, setProjectDescription] = useState('Loading...');
    const [renewablesMix, setRenewablesMix] = useState(0);
    const [nuclearMix, setNuclearMix] = useState(0);
    const [fossilFuelMix, setFossilFuelMix] = useState(0);
    const [averageCarbonIntensity, setAverageCarbonIntensity] = useState(0);

    const { projectType } = useParams();

    const [avgUsage, setAvgUsage] = useState(0);

    // For pausing intervals once we fetch the data. Not great, but less hacky
    const [statementAverageSuccess, setStatementAverageSuccess] = useState(false);
    const [gridMixSuccess, setGridMixSuccess] = useState(false);

    useEffect(async () => {
        const response = await fetch(`http://localhost:3000/offset_project?projectType=${projectType}`);
        const data = await response.json();
        setProjectImageURL(data.photos[0].url);
        setProjectId(data.id);
        setProjectName(data.name);
        setProjectLocation(data.country);
        setProjectDescription(data.description);
        setProjectPrice(data.average_price_per_tonne_cents_usd/100);
      }, []);

    
    useInterval(async () => {
        try {
            const response = await fetch(`http://localhost:3000/statements_average`);
            const data = await response.json();
            setAvgUsage(data.averageStatementUsage);
            setStatementAverageSuccess(true);
        } catch(e) {
            // do nothing, retry
        }
    } , statementAverageSuccess ? null : 1000);

    useInterval(async () => {
        try {
            const response = await fetch(`http://localhost:3000/utility_name`)
            const data = await response.json();
            setUtilityName(data.utilityName);

            const gridMixResponse = await fetch(`http://localhost:3000/grid_mix?utilityName=${utilityName}`);
            const gridMixData = await gridMixResponse.json();
            const generationMix = gridMixData.baGenerationMixes;

            setAverageCarbonIntensity(gridMixData.averageTonnesCo2PerKwH);

            for (var i = 0; i < 3; i++) {
                if (generationMix[i].generationSource.name === 'Renewables') {
                    setRenewablesMix((generationMix[i].averageGridContribution * 100).toFixed(0));
                }
                else if (generationMix[i].generationSource.name === 'Nuclear') {
                    setNuclearMix((generationMix[i].averageGridContribution * 100).toFixed(0));
                }
                else if (generationMix[i].generationSource.name === 'Fossil Fuel') {
                    setFossilFuelMix((generationMix[i].averageGridContribution * 100).toFixed(0));
                }
            }
            setGridMixSuccess(true);
        } catch(e) {
            // do nothing, retry
        }
    } , gridMixSuccess ? null : 1000);

    const history = useHistory();

    let offsetMessage = 'project that has the most beneficial impact';

    switch (projectType) {
        case 'affordable':
            offsetMessage = 'most affordable project available';
            break;
        case 'local':
            offsetMessage = 'project that most benefits your local community';
            break;
        case 'permanent':
            offsetMessage = 'project that will have the most lasting benefits';
            break;
        case 'rd':
            offsetMessage = 'project that will most effectively fuel technological advancement';
            break;
    }

    return (
        <div className="container">
            <Row className="justify-content-md-center mt-3">
                <Col xs={12} sm={6}>
                    <Button variant="outline-dark" onClick={() => history.push('/select')}>◀</Button>
                    <h3>Here’s the best carbon offset for you</h3>
                    <p>We’ve found the {offsetMessage} for your utility ({utilityName}).</p>

                    <Card className="mb-3">
                        <Card.Img variant="top" src={projectImageURL} />

                        <Card.Body>
                            <Card.Title>{projectName}</Card.Title>
                            <Card.Text>
                                <Row className="g-0">
                                    <Col>{projectLocation}</Col>
                                    <Col className="text-end"><span className="text-success">${projectPrice.toFixed(2)}</span> per tonne CO2</Col>
                                </Row>
                                <Row>
                                    <Col>{projectDescription}</Col>
                                </Row>
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Text>
                                <p>The electricity generated by your utility ({utilityName}) is a mix of different fuel sources.</p>
                                <Row>
                                    <Col className="text-center">
                                        <p className="fs-1">{renewablesMix}%</p>
                                        <p>renewable</p>
                                    </Col>
                                    <Col className="text-center">
                                        <p className="fs-1">{nuclearMix}%</p>
                                        <p>nuclear</p>
                                    </Col>
                                    <Col className="text-center">
                                        <p className="fs-1">{fossilFuelMix}%</p>
                                        <p>fossil fuel</p>
                                    </Col>
                                </Row>
                                <Row>

                                    <ul className="list-unstyled list-inline" style={{borderRadius:"10px"}}>
                                        <li className="list-inline-item me-0 rounded-start renewable" style={{backgroundColor:"#1B511F",width:`${renewablesMix}%`}}>&nbsp;</li>
                                        <li className="list-inline-item me-0 nuclear" style={{backgroundColor:"#66ACFD",width:`${nuclearMix}%`}}>&nbsp;</li>
                                        <li className="list-inline-item me-0 fossil rounded-end" style={{backgroundColor:"#6E7B84",width:`${fossilFuelMix}%`}}>&nbsp;</li>
                                    </ul>
                                    <ul className="list-unstyled list-inline text-center">
                                        <li className="list-inline-item"><span className="legend wind" />Renewable</li>
                                        <li className="list-inline-item"><span className="legend nuclear" />Nuclear</li>
                                        <li className="list-inline-item"><span className="legend other" />Fossil fuel</li>
                                    </ul>
                                </Row>
                            </Card.Text>
                        </Card.Body>
                    </Card> 
                   

                    <Row className="mb-3">
                        <Col className="text-muted">
                        Your average kWh usage per month
                        </Col>
                        <Col className="text-end">
                            {avgUsage ? avgUsage.toFixed(0) : 'Loading average usage...'}
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col className="text-muted">Average tonnes CO₂ emitted per kWh in {utilityName}'s service territory.</Col>
                        <Col className="text-end">
                            {averageCarbonIntensity}
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col className="text-muted">Average tonnes CO₂ you emit per month</Col>
                        <Col className="text-end">
                            {(averageCarbonIntensity * avgUsage).toFixed(2)}
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col className="text-muted">Removal price per tonne CO₂</Col>
                        <Col className="text-end text-success">
                            {(projectPrice).toFixed(2)}
                        </Col>
                    </Row>
                    <Row className="text-primary">
                        <Col>Average monthly carbon removal subscription fee</Col>
                        <Col className="text-end">
                            ${(averageCarbonIntensity * avgUsage * (projectPrice)).toFixed(2)}
                        </Col>
                    </Row>

                    <div className="d-grid my-3">
                        <Button variant="dark" onClick={() => buyProject(projectId, (100 * averageCarbonIntensity * avgUsage * (projectPrice)))} >
                            Subscribe for ${(averageCarbonIntensity * avgUsage * (projectPrice)).toFixed(2)} per month
                        </Button>
                    </div>

                    <p className="text-muted">Note that this is an estimated fee. Your actual monthly fee will vary based on your electricity usage.</p>

                </Col>
            </Row>
        </div>
    )
}

export default CarbonOffsetProjectDetail;