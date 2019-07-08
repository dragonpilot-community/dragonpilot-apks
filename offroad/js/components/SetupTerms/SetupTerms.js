import React, { Component } from 'react';
import ScrollThrough from '../ScrollThrough';

import PropTypes from 'prop-types';

import { ScrollView, View, Text } from 'react-native';
import Documents from './Documents';

import X from '../../themes';
import SetupStyles from '../Setup';
import Styles from './SetupTermsStyles';

export default class SetupTerms extends Component {
    static propTypes = {
        onAccept: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            hasScrolled: false,
        };
    }

    onScroll = ({ nativeEvent }) => {
        if (!this.state.hasScrolled) {
            this.setState({ hasScrolled: true });
        }
    }

    render() {
        const { hasScrolled } = this.state;

        return (
            <ScrollThrough
                onPrimaryButtonClick={ this.props.onAccept }
                primaryButtonText={ hasScrolled ? '我同意這些條款' : '續續閱讀' }
                secondaryButtonText={ '不同意' }
                onScroll={ this.onScroll }
                primaryButtonEnabled={ hasScrolled }>
                <X.Text weight='semibold' color='white'>Comma.ai, Inc. 條款和條件</X.Text>
                <X.Text size='small' color='white' style={ Styles.tosText }>{ Documents.TOS }</X.Text>
                <X.Text size='small' color='white'>隱私政策請至 https://community.comma.ai/privacy.html 查看</X.Text>
            </ScrollThrough>
        );

    }
}
