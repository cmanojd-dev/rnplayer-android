import { extendTheme } from 'native-base';

const CustomTheme = extendTheme({
  components: {
    Skeleton: {
      baseStyle: {
        startColor: 'gray.300',
        endColor: 'gray.200',
        speed: 2,
      },
    },
    SkeletonText: {
      baseStyle: {
        startColor: 'gray.300',
        endColor: 'gray.200',
        speed: 2,
      },
    },
  },
});

export { CustomTheme };
