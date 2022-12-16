// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {Channel} from '@mattermost/types/channels';
import {Team} from '@mattermost/types/teams';

import {t} from 'utils/i18n';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import UnarchiveIcon from 'components/widgets/icons/unarchive_icon';
import SharedChannelIndicator from 'components/shared_channel_indicator';
import RenameChannelModal from 'components/rename_channel_modal';

import './channel_profile.scss';

interface RenameChannelButtonProps {
    channel: Channel;
}
const RenameChannelButton = ({
    channel,
}: RenameChannelButtonProps) => {
    const [show, setShow] = React.useState(false);
    return (
        <>
            { show && (
                <RenameChannelModal
                    channel={channel}
                    onExited={() => setShow(false)}
                />
            ) }
            <button
                type='button'
                className='team-channel-action-button'
                data-testid='renameChannel'
                onClick={() => setShow(true)}
            >
                <FormattedMessage
                    id='admin.channel_settings.channel_detail.renameChannel'
                    defaultMessage='Rename Channel'
                />
            </button>
        </>
    );
};

interface ChannelProfileProps {
    channel: Channel;
    team: Team;
    onToggleArchive?: () => void;
    isArchived: boolean;
    isDisabled?: boolean;
}
export const ChannelProfile: React.SFC<ChannelProfileProps> = (props: ChannelProfileProps): JSX.Element => {
    const {team, channel, isArchived, isDisabled} = props;

    let archiveBtnID;
    let archiveBtnDefault;
    if (isArchived) {
        t('admin.channel_settings.channel_details.unarchiveChannel');
        archiveBtnID = 'admin.channel_settings.channel_details.unarchiveChannel';
        archiveBtnDefault = 'Unarchive Channel';
    } else {
        t('admin.channel_settings.channel_details.archiveChannel');
        archiveBtnID = 'admin.channel_settings.channel_details.archiveChannel';
        archiveBtnDefault = 'Archive Channel';
    }

    let sharedBlock;
    if (channel.shared && channel.type) {
        sharedBlock = (
            <div className='channel-organizations'>
                <FormattedMarkdownMessage
                    id='admin.channel_settings.channel_detail.channelOrganizations'
                    defaultMessage='**Organizations**'
                />
                <br/>
                <SharedChannelIndicator
                    className='shared-channel-icon'
                    channelType={channel.type}
                />
                <FormattedMessage
                    id='admin.channel_settings.channel_detail.channelOrganizationsMessage'
                    defaultMessage='Shared with trusted organizations'
                />
            </div>
        );
    }

    return (
        <AdminPanel
            id='channel_profile'
            titleId={t('admin.channel_settings.channel_detail.profileTitle')}
            titleDefault='Channel Profile'
            subtitleId={t('admin.channel_settings.channel_detail.profileDescription')}
            subtitleDefault='Summary of the channel, including the channel name.'
        >
            <div className='group-teams-and-channels AdminChannelDetails'>
                <div className='group-teams-and-channels--body channel-desc-col'>
                    <div className='d-flex'>
                        <div className='channel-desc-col'>
                            <div className='channel-name row-bottom-padding'>
                                <FormattedMarkdownMessage
                                    id='admin.channel_settings.channel_detail.channelName'
                                    defaultMessage='**Name**'
                                />
                                <br/>
                                {channel.display_name}
                            </div>
                            <div className='channel-team'>
                                <FormattedMarkdownMessage
                                    id='admin.channel_settings.channel_detail.channelTeam'
                                    defaultMessage='**Team**'
                                />
                                <br/>
                                {team.display_name}
                            </div>
                        </div>
                        <div className='channel-desc-col'>
                            <div className='row-bottom-padding'>
                                <FormattedMarkdownMessage
                                    id='admin.channel_settings.channel_detail.channelId'
                                    defaultMessage='**Channel ID**'
                                />
                                <br/>
                                {channel.id}
                            </div>
                            {sharedBlock}
                        </div>
                    </div>

                    <div className='AdminChannelDetails_archiveContainer'>
                        <div className='d-flex flex-row'>
                            <RenameChannelButton channel={channel}/>
                            <button
                                type='button'
                                className={
                                    classNames(
                                        'btn',
                                        'btn-secondary',
                                        'ArchiveButton',
                                        {ArchiveButton___archived: isArchived},
                                        {ArchiveButton___unarchived: !isArchived},
                                        {disabled: isDisabled},
                                    )
                                }
                                onClick={props.onToggleArchive}
                            >
                                {isArchived ? <UnarchiveIcon className='channel-icon channel-icon__unarchive'/> : <ArchiveIcon className='channel-icon channel-icon__archive'/>}
                                <FormattedMessage
                                    id={archiveBtnID}
                                    defaultMessage={archiveBtnDefault}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminPanel>
    );
};
