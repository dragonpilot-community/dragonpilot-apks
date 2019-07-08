import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import { View } from 'react-native';

import X from '../../themes';
import Styles from './PairAfterSetupStyles'
import Pairing from '../Pairing';

class PairAfterSetup extends Component {
    static navigationOptions = {
        header: null,
    }
    constructor(props) {
        super();

        this.state = {
            pairConfirmed: false
        }
        this.onPairConfirmed = this.onPairConfirmed.bind(this);
    }

    onPairConfirmed() {
        this.setState({ pairConfirmed: true });
    }

    handlePressedBack() {
        const { route } = this.state;
        this.props.navigateHome();
    }

    render() {
        return (
            <X.Gradient color='dark_blue'>
                <View style={ Styles.pairAfterSetup }>
                    <View style={ Styles.pairAfterSetupHeader }>
                        <X.Button
                            color='ghost'
                            size='small'
                            onPress={ () => this.handlePressedBack() }>
                            {'<  配對 EON'}
                        </X.Button>
                    </View>
                    <View style={{ flex: 1 }}>
                        { !this.state.pairConfirmed ?
                          <Pairing onPairConfirmed={ this.onPairConfirmed } onContinueButton={  () => this.handlePressedBack() } skipText='返回' continueText='返回' />
                         :
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <X.Text color='white'>EON 已配對</X.Text>
                            </View>
                        }
                    </View>
                </View>
            </X.Gradient>
        );

    }
}

function mapStateToProps(state) {
    return {
        isPaired: state.host.device && state.host.device.is_paired,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        navigateHome: () => {
            dispatch(NavigationActions.reset({
                index: 0,
                key: null,
                actions: [
                    NavigationActions.navigate({ routeName: 'Home' })
                ]
            }));
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(PairAfterSetup);
