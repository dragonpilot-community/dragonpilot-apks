import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import X from '../../themes';
import SetupContainer from '../SetupContainer';

import Styles from './SetupWelcomeStyles';

class SetupWelcome extends Component {
    static navigationOptions = {
        header: null,
    };

    render() {
        return (
            <SetupContainer>
                <View style={ Styles.content }>
                    <X.Text
                        size='jumbo'
                        weight='semibold'
                        color='white'
                        style={ Styles.welcomeText }>欢迎</X.Text>
                    <X.Text
                        size='medium'
                        color='white'
                        style={ Styles.detailText }>在开始之前，让我们先介绍一些细节并连接到internet。</X.Text>
                    <View style={ Styles.setupButton }>
                        <X.Button
                            color='transparent'
                            size='full'
                            onPress={ this.props.navigateToSetup }>
                            <X.Gradient
                                colors={ [ 'rgb(26,48,64)', 'rgb(18,39,56)' ] }
                                style={ Styles.setupButtonGradient }>
                                <X.Text size='big' weight='semibold' color='white'>设置</X.Text>
                            </X.Gradient>
                        </X.Button>
                    </View>
                </View>
            </SetupContainer>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    navigateToSetup: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({
                    routeName: 'Setup',
                })
            ]
        }))
    }
});

export default connect(null, mapDispatchToProps)(SetupWelcome);
