import { PoiGroupOptions } from '../../src/types/plugin';

export const POI_ASCII_LETTERS: PoiGroupOptions = {
    id: 1,
    type: 'primary',
    minZoom: 12,
    elevation: 40,
    fontSize: 10,
    fontColor: '#aa3a3a',
    data: [
        {
            coordinates: [82.886454, 54.98075],
            elevation: 30,
            label: '@<>?|!@#$%\n^&*()_+-=\n3к\n78.4 м²',
            userData: {
                url: 'https://example.com/',
            },
        },
    ],
};

export const POI_ENG_RUS_LETTERS: PoiGroupOptions = {
    id: 2,
    type: 'secondary',
    minZoom: 12,
    elevation: 20,
    fontSize: 10,
    fontColor: '#3a3a3a',
    data: [
        {
            coordinates: [82.886104, 54.98075],
            elevation: 30,
            label: 'qwe RTY пои ГРУП',
            userData: {
                url: 'https://example.com/',
            },
        },
    ],
};
