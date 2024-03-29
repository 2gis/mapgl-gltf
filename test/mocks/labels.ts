import { LabelGroupOptions } from '../../src/types/plugin';

export const LABEL_ASCII_LETTERS: LabelGroupOptions = {
    id: '1',
    image: {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHJ4PSI0IiBmaWxsPSIjZWFlYWVhIi8+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9IjI2IiBoZWlnaHQ9IjI2IiByeD0iMyIgZmlsbD0id2hpdGUiLz48L3N2Zz4=',
        size: [38, 38],
        stretchX: [[4, 24]],
        stretchY: [[4, 24]],
        padding: [5, 10, 5, 10],
    },
    minZoom: 12,
    elevation: 40,
    fontSize: 10,
    fontColor: '#aa3a3a',
    labels: [
        {
            coordinates: [82.886454, 54.98075],
            elevation: 30,
            text: '@<>?|!@#$%\n^&*()_+-=\n3к\n78.4 м²',
            userData: {
                url: 'https://example.com/',
            },
        },
    ],
};

export const LABEL_ENG_RUS_LETTERS: LabelGroupOptions = {
    id: '2',
    minZoom: 12,
    elevation: 20,
    fontSize: 10,
    fontColor: '#3a3a3a',
    labels: [
        {
            coordinates: [82.886104, 54.98075],
            elevation: 30,
            text: 'qwe RTY пои ГРУП',
            userData: {
                url: 'https://example.com/',
            },
        },
    ],
};
