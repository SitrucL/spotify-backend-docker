import util from 'util';
import axios, { AxiosResponse } from 'axios';
import { EpisodeObject, TrackObjectFull, UsersQueueResponse } from './shopify';

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
axios({
    method: `GET`,
    url: `https://api.spotify.com/v1/me/player/queue`,
    headers: {
        Authorization: `Bearer BQAIQidFVXzxRoGd3HjHmNOoQATi512KsfNTHYzwjBTIe1OoDMgQqWWZ1EV1KP7iTjMWIZHtuJtQpqNec5IEwSig2t3ep9MO4PNrA2l9xzKLvvwmE8-KL3eY_LOqLE6RhhXf8_OEWV5cyKqm1J4YGzR9m_BkW0JbTLU1_TVJD0Zj8M1Ne6DHdVvAIb8KWY36ATGqPcP2sCk"`,
    },
})
    .then(function (response: AxiosResponse<UsersQueueResponse>) {
        const currentlyPlaying = response.data.currently_playing;

        const normalisedData = normaliseCurrentlyPlaying(currentlyPlaying);

        console.log(util.inspect(normalisedData, { showHidden: false, depth: null, colors: true }));
    })
    .catch(function (error) {
        console.log(`error:`, error);
    });
