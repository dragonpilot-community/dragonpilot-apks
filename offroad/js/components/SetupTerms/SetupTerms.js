import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ChffrPlus from '../../native/ChffrPlus';
import { Params } from '../../config';
import { resetToLaunch } from '../../store/nav/actions';
import Documents from './Documents';
import ScrollThrough from '../ScrollThrough';
import X from '../../themes';
import Styles from './SetupTermsStyles';

class SetupTerms extends Component {
    static navigationOptions = {
        header: null,
    };

    static propTypes = {
        onAccept: PropTypes.func,
    };

    render() {
        const { onAccept } = this.props;
        return (
            <X.Gradient
                color='flat_blue'>
                <X.Entrance style={ Styles.setupTerms }>
                    <View style={ Styles.setupTermsHeader }>
                        <X.Text
                            color='white'
                            size='big'
                            weight='bold'>
                            Review Terms
                        </X.Text>
                    </View>
                    <ScrollThrough
                        onPrimaryButtonClick={ onAccept }
                        primaryButtonText='我同意這些條款'
                        primaryButtonTextDisabled='續續閱讀'
                        secondaryButtonText='不同意'
                        scrollViewStyles={ Styles.setupTermsScrollView }>
                        <X.Text weight='semibold' color='white'>Comma.ai, Inc. 條款和條件</X.Text>
                        <X.Text size='small' color='white' style={ Styles.tosText }>{ Documents.TOS }</X.Text>
                        <X.Text size='small' color='white'>隱私政策請至 https://my.comma.ai/privacy.html 查看</X.Text>
                    </ScrollThrough>
                </X.Entrance>
            </X.Gradient>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return ({
        onAccept: async function() {
            const termsVersion = await ChffrPlus.readParam(Params.KEY_LATEST_TERMS_VERSION);
            ChffrPlus.writeParam(Params.KEY_ACCEPTED_TERMS_VERSION, termsVersion);
            dispatch(resetToLaunch());
        }
    });
}

export default connect(null, mapDispatchToProps)(SetupTerms);
