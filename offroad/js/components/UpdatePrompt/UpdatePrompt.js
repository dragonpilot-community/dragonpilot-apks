import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import X from '../../themes';
import ChffrPlus from '../../native/ChffrPlus';

import ScrollThrough from '../ScrollThrough';

// i18n
import {t, Trans} from "@lingui/macro"
import {i18n} from "../../utils/I18n";

class UpdatePrompt extends Component {
    static navigationOptions = {
        header: null,
    };

    onUpdatePressed = () => {
        this.props.dismiss();
        ChffrPlus.resetAndReboot();
    }

    render() {
        return (
            <X.Gradient
                color='dark_blue'
                style={ { padding: 26, paddingTop: 10 } }>
                <ScrollThrough
                    onPrimaryButtonClick={ this.onUpdatePressed }
                    onSecondaryButtonClick={ this.props.dismiss }
                    primaryButtonText={ i18n._(t`Reboot and Update`) }
                    secondaryButtonText={ i18n._(t`Later`) }
                    onScroll={ this.onScroll }
                    enabled={ true }>
                    <X.Text color='white' size='big' weight='semibold'><Trans>Update Available</Trans></X.Text>
                    <X.Line />
                    <X.Text color='white'>
                        { this.props.navigation.state.params.releaseNotes }
                    </X.Text>
                </ScrollThrough>
            </X.Gradient>
        )
    }
}

const mapDispatchToProps = (dispatch) => ({
    dismiss: () => dispatch(NavigationActions.navigate({ routeName: 'Home' })),
});

export default connect(null, mapDispatchToProps)(UpdatePrompt);
