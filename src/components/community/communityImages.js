import communityImage1 from '../../assets/community/community.jpg';
import communityImage2 from '../../assets/community/community2.jpg';
import communityImage3 from '../../assets/community/community3.jpg';
import communityImage4 from '../../assets/community/community4.jpg';
import communityImage5 from '../../assets/community/community5.jpg';
import communityImage6 from '../../assets/community/community6.jpg';
import communityImage7 from '../../assets/community/community7.jpg';
import communityImage8 from '../../assets/community/community8.jpg';
import communityImage9 from '../../assets/community/community9.png';

export const COMMUNITY_IMAGES = {
  community1: communityImage1,
  community2: communityImage2,
  community3: communityImage3,
  community4: communityImage4,
  community5: communityImage5,
  community6: communityImage6,
  community7: communityImage7,
  community8: communityImage8,
  community9: communityImage9,
};

export const resolveCommunityImageSource = image => {
  if (!image) {
    return null;
  }

  if (typeof image === 'string') {
    return {uri: image};
  }

  return image;
};
