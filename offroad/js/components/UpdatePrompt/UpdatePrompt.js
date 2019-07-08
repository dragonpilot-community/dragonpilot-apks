import React, { Component } from 'react';
import { connect } from 'react-redux';

import X from '../../themes';
import ChffrPlus from '../../native/ChffrPlus';

import {
    dismissUpdatePrompt,
    ACTION_UPDATE_CHECKED,
} from '../../store/updater/actions';

import SetupContainer from '../SetupContainer';
import ScrollThrough from '../ScrollThrough';

class UpdatePrompt extends Component {
    static navigationOptions = {
        header: null,
    };

    onUpdatePressed = () => {
        this.props.onDismiss();
        this.props.setUpdateAvailable(false);
        ChffrPlus.doUpdate();
    }

    render() {
        return (
            <SetupContainer>
                <ScrollThrough
                    onPrimaryButtonClick={ this.onUpdatePressed }
                    onSecondaryButtonClick={ this.props.onDismiss }
                    primaryButtonText={ '重啟並更新系統' }
                    secondaryButtonText={ '稍後' }
                    onScroll={ this.onScroll }>
                    <X.Text color='white' size='big' weight='semibold'>系統更新</X.Text>
                    <X.Line />
                    <X.Text color='white'>
                        { '請注意，系統的行為可能會有不同。\n\n' }
                        { this.props.releaseNotes }
                    </X.Text>
                </ScrollThrough>
            </SetupContainer>
        )
    }
}

const mapStateToProps = (state) => ({
    shouldShowUpdatePrompt: state.updater.shouldShowUpdatePrompt,
    releaseNotes: state.updater.releaseNotes,
});

const mapDispatchToProps = (dispatch) => ({
    onDismiss: () => dispatch(dismissUpdatePrompt()),
    setUpdateAvailable: (isUpdateAvailable) => dispatch({ type: ACTION_UPDATE_CHECKED, isUpdateAvailable }),
});

export default connect(mapStateToProps, mapDispatchToProps)(UpdatePrompt);