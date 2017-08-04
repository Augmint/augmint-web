import React from 'react'
import { Grid, Row, Col, PageHeader} from 'react-bootstrap';

export const PageNotFound = (props) => {
    return (

        <Grid>
            <Row>
                <Col>
                    <PageHeader>
                        Khm...
                    </PageHeader>
                </Col>
            </Row>
            <Row>
            <p>What's {props.location.pathname} ? Not sure.</p>
            </Row>
        </Grid>
    )
}
