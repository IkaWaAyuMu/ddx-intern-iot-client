import { Dimensions, FlatList } from "react-native";
import { View, Text } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import { useRef, useState } from "react";
import { Link } from "expo-router";

export function Cards(props: { data: { title: string, value: string | number, unit: string, color?: string }[] }) {

  const ref = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleIndexChange = (newIndex: number) => setCurrentIndex(newIndex);

  const onLayout = () => {
    ref.current?.scrollToIndex({
        index: 0,
        viewPosition: 0.5,
    });
  };

  return (
    <View style={styles.cardCarouselParent}>
      <FlatList
        ref={ref}
        style={styles.cardCarousel}
        data={props.data}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment={'center'}
        onLayout={onLayout}
        decelerationRate={'fast'}
        keyExtractor={(item, index) => index.toString()}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.floor(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
          handleIndexChange(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={styles.cardParent}>
            <View style={styles.card} key={item.title}>
              {item.color && <View style={{ ...styles.background, backgroundColor: item.color }} />}
              <View style={styles.spacer1rem} />
              <View style={styles.cardFrame}>
                <View>
                  <View style={styles.spacerp75rem} />
                  <Text style={{ ...styles.cardText, ...styles.cardTitle }}>{item.title}</Text>
                  <View style={styles.spacerp75rem} />
                </View>
                <View>
                  <View style={styles.spacer1rem} />
                  <Text style={{ ...styles.cardText, ...styles.cardValue }}>{item.value}</Text>
                  <Text style={{ ...styles.cardText, ...styles.cardUnit }}>{item.unit}</Text>
                </View>
              </View>
              <View style={styles.spacer1rem} />
            </View>
          </View>
        )} />
      <View style={styles.spacer1p25rem}/>
      <View style={styles.cardCarouselPagination}>
        {props.data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.activePaginationDot,
            ]}
          />
        ))}
      </View>
    </View>
  )
}

export function CardGroup(props: {
  title: string,
  description: string,
  icon: JSX.Element,
  color?: string,
  grouplink?: string,
  data: {
    title: string,
    value: string | number,
    unit: string,
    color?: string,
  }[]
}) {

  return (
    <View style={styles.cardGroup}>
      <View style={{ ...styles.background, backgroundColor: props.color ?? "#999999"}}/>
      <View style={styles.spacer1rem} />
      <View style={styles.cardGroupFrame}>
        <View style={{ flex: 1 }}>
          <Text style={{ ...styles.cardGroupText, ...styles.cardTitle }}>{props.title}</Text>
          <View style={styles.spacerp75rem} />
          <Text style={{ ...styles.cardGroupText, ...styles.cardGroupDescriptionText }}>{props.description}</Text>
          <View style={styles.spacerp75rem} />
        </View>
        <View style={styles.cardGroupIcon}>{props.icon}</View>
      </View>
      {props.grouplink && <View style={styles.seeMoreButtonParent}><Link href={props.grouplink} style={styles.seeMoreButton}><Text style={styles.seeMoreText}>See more</Text></Link></View>}
      <Cards data={props.data} />
    </View>
  )
}

export function LastUpdated(props: { time: Date, brand: string, model: string }) {
  return (
    <Text style={styles.lastUpdate}>Last update {props.time.toLocaleString()}.{"\n"}Update data from {props.brand} {props.model} Sensor.</Text>
  )
}

const styles = EStyleSheet.create({
  briefInfo: {
    paddingHorizontal: '1.25rem',
    rowGap: '1rem',
  },
  cardGroup: {
    borderWidth: 2,
    borderColor: '$gray',
    borderRadius: '0.75rem',
    paddingHorizontal: '1rem',
    marginHorizontal: '1.25rem',
    overflow: 'hidden',
  },
  cardGroupFrame: {
    flexDirection: 'row',
    paddingLeft: '1rem',
  },
  cardGroupText: {
    color: '$darkTextColor'
  },
  cardGroupDescriptionText: {
    fontSize: '1rem',
    fontFamily: 'UberMoveText-Medium',
    lineHeight: '1.5rem',
  },
  cardGroupIcon: {
    width: '5.5rem',
    alignItems: 'center',
  },
  seeMoreButtonParent: {
    alignItems: 'center',
  },
  seeMoreButton: {
    backgroundColor: '$gray',
    borderRadius: '0.875rem',
    height: '1.75rem',
    paddingTop: '0.6rem',
    paddingHorizontal: '0.5rem',
  },
  seeMoreText: {
    fontFamily: 'UberMoveText-Medium',
    fontSize: '0.75rem',
    lineHeight: '0.75rem',
  },
  cardCarouselParent: {
    paddingVertical: '1rem',
  },
  cardCarousel: {
    flex: 1,
  },
  cardCarouselPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: '0.5rem'
  },
  paginationDot: {
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: 999,
    backgroundColor: '#e8e8e8',
  },
  activePaginationDot: {
    backgroundColor: '#000',
  },
  cardParent: {
    width: Dimensions.get('window').width,
    paddingHorizontal: '3.5rem',
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e2e2',
    borderRadius: '0.75rem',
    paddingLeft: '1rem',
    paddingRight: '0.5rem',
    overflow: 'hidden',
  },
  background: {
    position: "absolute",
    width: "$infinity",
    height: "$infinity",
  },
  cardFrame: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardText: {
    color: '$textColor'
  },
  cardTitle: {
    fontFamily: 'UberMove-Bold',
    fontSize: '1.5rem',
    lineHeight: '2rem',
  },
  cardValue: {
    fontSize: '2rem',
    fontFamily: 'UberMoveMono-Medium',
    lineHeight: '2rem',
    textAlign: 'right',
  },
  cardUnit: {
    fontSize: '0.625rem',
    fontFamily: 'UberMoveText-Light',
    lineHeight: '0.625rem',
    textAlign: 'right',
  },
  lastUpdate: {
    fontSize: '0.625rem',
    fontFamily: 'UberMoveText-Light',
    lineHeight: '0.625rem',
    textAlign: 'center',
  },
  spacer1rem: {
    height: '1rem',
    width: '100%'
  },
  spacerp75rem: {
    height: '1rem',
    width: '100%'
  },
  spacer1p25rem: {
    height: '1.25rem',
    width: '100%'
  },
});