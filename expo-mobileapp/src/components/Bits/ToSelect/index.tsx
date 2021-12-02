import React, { FC, useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Autocomplete from 'react-native-autocomplete-input';
import { Tokens, Token } from './api';
import TOKEN_LIST from '../../../data/TokenList.json';




const ToSelect: FC = () => {
	const [allTokens, setAllTokens] = useState<Tokens | null>(null);
	const [selectedValue, setSelectedValue] = useState('');
	const queriedTokens = allTokens?.query(selectedValue);
	const isLoading = !allTokens?.length;
	const placeholder = isLoading?'Loading data...' : 'Select Token';

	useEffect(() => {
		fetchTokens();
	}, []);

	const fetchTokens =() => {
		let list:any =  TOKEN_LIST.map((token:any)=>new Token(token));
		setAllTokens(new Tokens(...list));
	}

  const selectValue = (item) =>{
    console.log('Selected Values:', item);
    setSelectedValue(item?.name);
  }

	return (
		<View style={styles.autocompleteContainer}>
        {<Autocomplete
          editable={!isLoading}
          autoCorrect={false}
          data={
            queriedTokens?.length === 1 && queriedTokens[0].compareName(selectedValue)
              ? [] // Close suggestion list in case movie title matches query
              : queriedTokens
          }
          value={selectedValue}
          onChangeText={setSelectedValue}
          placeholder={placeholder}
          flatListProps={{
            keyboardShouldPersistTaps: 'always',
            keyExtractor: (_, idx) => idx,
            renderItem: ({item}) => (
              <TouchableOpacity onPress={()=>selectValue(item)}>
                <Text style={styles.itemText}>{item.name}</Text>
              </TouchableOpacity>
            ),
          }}
        />}
      </View>
	);
};

export default ToSelect;


const styles = StyleSheet.create({
 	autocompleteContainer: {
    // Hack required to make the autocomplete
    // work on Andrdoid
    flex: 1,
    left: 0,
    position: 'relative',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  itemText: {
    fontSize: 15,
    margin: 2,
  },

});
