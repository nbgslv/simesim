import React from 'react';
import {Col, Container, Row, Table} from "react-bootstrap";

const QuickView = ({ formerUserPlans, nextUserPlans }) => {
    return (
        <Container>
            {nextUserPlans && (
                <Row>
                    <Col>
                        <h2>החבילות הבאות שלך</h2>
                    </Col>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>תאריך תחילת החבילה</th>
                                <th>תאריך סיום החבילה</th>
                                <th>סכום</th>
                                <th>סטטוס</th>
                            </tr>
                            </thead>
                            <tbody>
                            {nextUserPlans.map((plan) => (
                                <tr>
                                    <td>{plan.startDate}</td>
                                    <td>{plan.endDate}</td>
                                    <td>{plan.amount}</td>
                                    <td>{plan.status}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            )}
            {formerUserPlans && (
                <Row>
                    <Col>
                        <h2>החבילות הקודמות שלך</h2>
                    </Col>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>תאריך תחילת החבילה</th>
                                <th>תאריך סיום החבילה</th>
                                <th>סכום</th>
                            </tr>
                            </thead>
                            <tbody>
                            {formerUserPlans.map((plan) => (
                                <tr>
                                    <td>{plan.startDate}</td>
                                    <td>{plan.endDate}</td>
                                    <td>{plan.amount}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default QuickView;
