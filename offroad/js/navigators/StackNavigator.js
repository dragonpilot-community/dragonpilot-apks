import React from 'react';
import PropTypes from 'prop-types';
import {
    StackNavigator as RNStackNavigator,
    addNavigationHelpers,
} from 'react-navigation';
import { View } from 'react-native';
import { withMappedNavigationAndConfigProps } from 'react-navigation-props-mapper';
import { connect } from 'react-redux';

import Loader from '../components/Loader';
import Home from '../components/Home';
import Settings from '../components/Settings';
import SettingsWifi from '../components/SettingsWifi';
import SetupTerms from '../components/SetupTerms';
import SetupWifi from '../components/SetupWifi';
import SetupQr from '../components/SetupQr';
import Onboarding from '../components/training/Onboarding';
import GiraffeSwitch from '../components/training/GiraffeSwitch'
import UpdatePrompt from '../components/UpdatePrompt';
import DragonpilotSettings from '../components/DragonpilotSettings'

export const StackNavigator = RNStackNavigator({
    Loader: { screen: Loader },
    Home: { screen: Home },
    SetupTerms: { screen: SetupTerms },
    SetupWifi: { screen: SetupWifi },
    SetupQr: { screen: SetupQr },
    Onboarding: { screen: Onboarding },
    GiraffeSwitch: { screen: GiraffeSwitch },
    Settings: { screen: Settings },
    SettingsWifi: { screen: SettingsWifi },
    UpdatePrompt: { screen: UpdatePrompt },
    DragonpilotSettings: { screen: DragonpilotSettings },
});


const StackNavigatorWithHelpers = ({ dispatch, nav }) => (
    <StackNavigator
        navigation={ addNavigationHelpers({ dispatch, state: nav })}
    />
);

StackNavigatorWithHelpers.propTypes = {
    dispatch: PropTypes.func.isRequired,
    nav: PropTypes.object.isRequired,
};

const mapStateToProps = ({ nav }) => ({ nav });
export default connect(mapStateToProps)(StackNavigatorWithHelpers);
