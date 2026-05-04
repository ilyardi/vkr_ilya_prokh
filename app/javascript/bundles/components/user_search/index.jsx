import React from 'react'
import Rest from 'tools/rest';
import { Select } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce } from 'lodash';
import Preloader from 'components/preloader';

const { Option } = Select;

class UserSelect extends React.Component {

    state = {
        users: [],
        loading: false,
    }

    loadUsers = () => {
        this.setState({ loading: true })
        Rest.get(`/api/v1/users/${this.props.scope}`).then((response) => {
            this.setState({
                loading: false,
                users: response.data.users,
            });
        });
    };

    componentDidMount() {
        this.loadUsers();
    }

    render() {
        const { loading, users } = this.state
        return <Preloader loading={loading}>
            <Select
                value={this.props.value}
                onChange={this.props.onChange}
                placeholder={this.props.placeholder}
                style={this.props.style}
                allowClear
                showSearch
            >
                {users.map((user) => (
                    <Option key={user.id} value={user.id}>{user.name}</Option>
                ))}
            </Select>
        </Preloader>
    }
}
export default UserSelect