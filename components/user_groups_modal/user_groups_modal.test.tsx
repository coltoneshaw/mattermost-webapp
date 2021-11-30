// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';
import UserGroupsModal from './user_groups_modal';
import groups from 'mattermost-redux/action_types/groups';
import { Group } from 'mattermost-redux/types/groups';

describe('component/user_groups_modal', () => {
    const baseProps = {
        onExited: jest.fn(),
        groups: [],
        myGroups: [],
        searchTerm: '',
        currentUserId: '',
        backButtonAction: jest.fn(),
        actions: {
            openModal: jest.fn(),
            getGroups: jest.fn(),
            setModalSearchTerm: jest.fn(),
            getGroupsByUserIdPaginated: jest.fn(),
            searchGroups: jest.fn(),
        },
    };

    function getGroups(numberOfGroups: number) {
        let groups: Group[] = [];
        for (let i = 0; i < numberOfGroups; i++) {
            groups.push({
                id: `group${i}`,
                name: `group${i}`,
                display_name: `Group ${i}`,
                description: `Group ${i} description`,
                source: 'custom',
                remote_id: null,
                create_at: 1637349374137,
                update_at: 1637349374137,
                delete_at: 0,
                has_syncables: false,
                member_count: i+1,
                allow_reference: true,
                scheme_admin: false,
            });
        }

        return groups;
    }

    test('should match snapshot without groups', () => {
        const wrapper = shallow(
            <UserGroupsModal 
                {...baseProps}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with groups', () => {
        const wrapper = shallow(
            <UserGroupsModal 
                {...baseProps}
                groups={getGroups(3)}
                myGroups={getGroups(1)}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with groups, myGroups selected', () => {
        const wrapper = shallow(
            <UserGroupsModal 
                {...baseProps}
                groups={getGroups(3)}
                myGroups={getGroups(1)}
            />
        );
        
        wrapper.setState({selectedFilter: 'my'});

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with groups, search group1', () => {
        const wrapper = shallow(
            <UserGroupsModal 
                {...baseProps}
                groups={getGroups(3)}
                myGroups={getGroups(1)}
                searchTerm='group1'
            />
        );

        const instance = wrapper.instance() as UserGroupsModal;

        let e = {
            target: {
                value: ''
            }
        };
        instance.handleSearch(e as React.ChangeEvent<HTMLInputElement>);
        expect(baseProps.actions.setModalSearchTerm).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.setModalSearchTerm).toBeCalledWith('');

        e.target.value = 'group1';
        instance.handleSearch(e as React.ChangeEvent<HTMLInputElement>);
        expect(wrapper.state('loading')).toEqual(true);
        expect(baseProps.actions.setModalSearchTerm).toHaveBeenCalledTimes(2);
        expect(baseProps.actions.setModalSearchTerm).toBeCalledWith(e.target.value);
    });
});