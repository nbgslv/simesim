import React from 'react';
import {Card, ListGroup} from "react-bootstrap";
import {Bundle} from "../../utils/api/sevices/keepGo/types";

const BundleCard = ({ title, description, bundle }: { title: string, description: string, bundle: Bundle }) => {
    return (
        <Card>
            <Card.Body>
                <Card.Title>{bundle.name}</Card.Title>
                <Card.Text>
                    {bundle.description}
                </Card.Text>
                <ListGroup>
                    {
                        bundle.refills.map((refill) => {
                            return (
                                <ListGroup.Item key={`${bundle.id}-${refill.title}`}>
                                    {refill.title} - {refill.price_usd + 1.2}$
                                </ListGroup.Item>
                            )
                        })
                    }
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default BundleCard;
