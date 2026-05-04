import React from "react";

class KinescopePlayer extends React.Component {
    state = {
        playerID: "video_" + parseInt(Math.random() * 1000),
    };

    componentDidMount() {
        if (this.props.playerID) {
            this.setState({ playerID: this.props.playerID });
        }
        this.createPlayer();
    }

    componentWillUnmount() {
        if (this.player && this.player.dispatch != null) {
            this.player.destroy();
        }
    }

    createPlayer() {
        const { source, params, options, oncePlay } = this.props;
        const { playerID } = this.state;
        this.player = window.Kinescope.Player.create(
            playerID,
            source,
            params,
            options
        );
        if (oncePlay) this.player.once("play", oncePlay);
    }

    render() {
        const { playerID } = this.state;

        return <div id={playerID} />;
    }
}

export default KinescopePlayer;
