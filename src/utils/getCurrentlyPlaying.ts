import util from 'util';
import axios, { AxiosResponse } from 'axios';
import { EpisodeObject, TrackObjectFull, UsersQueueResponse } from '../../spotify';

const normaliseCurrentlyPlaying = (data: TrackObjectFull | EpisodeObject) => {
    if (!data) {
        return {
            currentlyPlaying: {
                name: '',
                artists: [{ name: '', id: '', href: '' }],
                images: [{ url: '' }],
            },
        };
    }

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

const getCurrentlyPlaying = async (access_token: string) => {
    try {
        const response: AxiosResponse<UsersQueueResponse> = await axios({
            method: `GET`,
            url: `https://api.spotify.com/v1/me/player/queue`,
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const currentlyPlaying = response.data.currently_playing;
        if (currentlyPlaying) {
            console.log('currentlyPlaying: ', { name: currentlyPlaying.name }, `@ ${new Date().toISOString()}`);
        } else {
            console.log('NO TRACK PLAYING');
        }
        const normalisedData = normaliseCurrentlyPlaying(currentlyPlaying);
        return normalisedData;
    } catch (error) {
        console.log(`error getting current song:`, error);
    }
};

export default getCurrentlyPlaying;
