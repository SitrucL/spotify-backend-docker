import util from 'util';
import axios, { AxiosResponse } from 'axios';
import { EpisodeObject, TrackObjectFull, UsersQueueResponse } from '../spotify';

const normaliseCurrentlyPlaying = (data: TrackObjectFull | EpisodeObject) => {
    if ('album' in data) {
        const normalisedData = {
            currentlyPlaying: {
                name: data.name,
                artists: data.artists.map((artist) => ({ name: artist.name, id: artist.id, href: artist.href })),
                images: data.album.images,
            },
        };
        return normalisedData;
    }

    return {
        currentlyPlaying: {
            name: data.name,
            artists: [],
            images: data.images,
        },
    };
};

const getCurrentlyPlaying = (access_token: string) => {
    axios({
        method: `GET`,
        url: `https://api.spotify.com/v1/me/player/queue`,
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    })
        .then(function (response: AxiosResponse<UsersQueueResponse>) {
            const currentlyPlaying = response.data.currently_playing;

            const normalisedData = normaliseCurrentlyPlaying(currentlyPlaying);

            console.log(util.inspect(normalisedData, { showHidden: false, depth: null, colors: true }));
        })
        .catch(function (error) {
            console.log(`error getting current song:`, error);
        });
};

export default getCurrentlyPlaying;
