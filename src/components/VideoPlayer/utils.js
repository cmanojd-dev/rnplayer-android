import { forEach, get, isEmpty, isNumber } from 'lodash';
import { preloadTime } from './constants';

function formatTwoDigits(n) {
  return n < 10 ? `0${n}` : n;
}

export function formatTime(seconds) {
  let finalOutput; //= '00:00';

  if (!isNumber(seconds) || seconds <= 0 || !seconds) {
    seconds = 0;
  }

  // eslint-disable-next-line radix
  seconds = parseInt(seconds);

  let ss = Math.floor(seconds) % 60;
  if (!isNumber(ss)) {
    ss = 0;
  }

  let mm = Math.floor(seconds / 60) % 60;
  if (!isNumber(mm)) {
    mm = 0;
  }

  let hh = Math.floor(seconds / 3600);
  if (!isNumber(hh)) {
    hh = 0;
  }

  if (hh > 0) {
    finalOutput = hh + ':' + formatTwoDigits(mm) + ':' + formatTwoDigits(ss);
  } else {
    finalOutput = formatTwoDigits(mm) + ':' + formatTwoDigits(ss);
  }
  finalOutput = finalOutput.includes('-') ? '00:00' : finalOutput;
  if (finalOutput === 'NaN:NaN') {
    finalOutput = '00:00';
  }
  return finalOutput;
}

export const toTitleCase = phrase => {
  return phrase
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatVideoTracksArray = data => {
  let dataArray = [];
  if (Array.isArray(data) && data.length > 0) {
    forEach(data, obj => {
      const height = get(obj, 'height');
      const str = height !== 0 ? height + 'p' : height;
      const name = get(obj, 'name');
      const heightStr = name && height === 0 ? 'auto' : str;
      const nameStr = name ? name : heightStr;
      if (name || height > 0) {
        const dataObj = {
          displayName: nameStr,
          ...obj,
        };
        dataArray.push(dataObj);
      }
    });
  }
  return dataArray;
};

export const formatAudioTracksArray = data => {
  let dataArray = [];
  if (Array.isArray(data) && data.length > 0) {
    forEach(data, obj => {
      const name = get(obj, 'name');
      const title = get(obj, 'title');
      const nameStr = name ? name : title;
      const dataObj = {
        displayName: nameStr,
        ...obj,
      };
      dataArray.push(dataObj);
    });
  }
  return dataArray;
};

export function fileExtension(url) {
  if (url && url !== '') {
    return (url = url.substr(1 + url.lastIndexOf('/')).split('?')[0])
      .split('#')[0]
      .substr(url.lastIndexOf('.'));
  } else {
    return url;
  }
}

export const checkVideoRelatedUrl = urlValue => {
  try {
    if (!isEmpty(urlValue)) {
      return urlValue.startsWith('http://') || urlValue.startsWith('https://');
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const formatCastMediaList = (
  videoData,
  currentIndex,
  currentPosition,
) => {
  if (Array.isArray(videoData) && currentIndex >= 0) {
    let castMediaList = [];
    forEach(videoData, (video, index) => {
      if (index >= currentIndex) {
        castMediaList.push({
          autoplay: true,
          startTime: index === currentIndex ? currentPosition : 0,
          preloadTime,
          mediaInfo: {
            contentUrl: get(video, 'uri'),
            contentId: get(video, 'id'),
            metadata: {
              type: 'generic',
              images: [
                {
                  url: get(video, 'thumbnail'),
                },
              ],
              title: get(video, 'title'),
              subtitle: get(video, 'subtitle'),
            },
          },
        });
      }
    });
    const castMediaObj = {
      queueData: {
        items: castMediaList,
      },
    };
    return castMediaObj;
  }
  // ? Commented due to simplify and use same logic for both cases playlist videos & single video
  // else {
  //   const castMediaObj = {
  //     autoplay: true,
  //     startTime: currentPosition,
  //     preloadTime,
  //     mediaInfo: {
  //       contentUrl: get(videoData, 'uri'),
  //       metadata: {
  //         type: 'generic',
  //         images: [
  //           {
  //             url: get(videoData, 'thumbnail'),
  //           },
  //         ],
  //         title: get(videoData, 'title'),
  //         subtitle: get(videoData, 'subtitle'),
  //       },
  //     },
  //   };
  //   return castMediaObj;
  // }
};
