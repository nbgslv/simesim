import React from 'react';
import {Tab, Tabs} from "react-bootstrap";
import QuickView from "../UserTabs/QuickView/QuickView";

const UserDashboard = ({ formerUserPlans, nextUserPlans }) => {
    return (
        <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
            <Tab eventKey="home" title={'מבט מהיר'}>
                <QuickView formerUserPlans={formerUserPlans} nextUserPlans={nextUserPlans} />
            </Tab>
        </Tabs>
    );
};

export default UserDashboard;
