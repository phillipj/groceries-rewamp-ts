import React, { useReducer, useEffect, useState } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

import useLongPress from './use-long-press';

type Grocery = {
  text: string;
  isCompleted: boolean;
}

type State = {
  groceries: Array<Grocery>;
}

type Action =
  | { type: 'toggle', text: string }
  | { type: 'add', text: string }
  | { type: 'delete', grocery: Grocery }
  | { type: 'sort-completed-below-uncompleted' }

const localStorageKey = 'groceries'
const second = 1000

function getStateFromLocalStorage(): State {
  let groceries = [] as Array<Grocery>

  try {
    const serialisedGroceriesFromStorage = localStorage.getItem(localStorageKey)
    groceries = serialisedGroceriesFromStorage !== null ? JSON.parse(serialisedGroceriesFromStorage) as Array<Grocery> : []
  } catch (error) {
    // too bad we couldn't load from LocalStorage, but no biggie
  }

  return {
    groceries
  }
}

function storeStateToLocaleStorage(state: State) {
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(state.groceries))
  } catch (error) {
    // Buhu, could persist state... Maybe show a warning?
  }
}

const App: React.FC<{
  // Allowing state to be passed in for testing purposes, starting off from scratch..
  // Or maybe a good idea anyways, letting index.ts pass in initial state loaded from `window.localStorage`?
  initialState?: State
}> = ({ initialState }) => {
  const [ fieldText, setFieldText ] = useState(() => '')
  const [ isAutoCompleteDropdownVisible, setAutoCompleteDropdownVisible ] = useState(() => false)

  const [ showDeleteIcons, setShowDeleteIcons ] = useState(() => false)
  const groceryLongPressProps = useLongPress(() => setShowDeleteIcons(!showDeleteIcons), 500)

  const [ state, dispatch ] = useReducer((state: State, action: Action) => {
    switch (action.type) {
      case 'add':
        const toBeAdded = action.text.trim()
        const otherGroceries = state.groceries.filter(grocery => grocery.text.toLowerCase() !== toBeAdded.toLowerCase())

        return {
          groceries: [
            { text: toBeAdded, isCompleted: false },
            ...otherGroceries,
          ]
        };

      case 'delete':
        return {
          groceries: state.groceries.filter(grocery => grocery !== action.grocery)
        };

      case 'toggle':
        const oldGrocery = state.groceries.find(grocery => grocery.text.toLowerCase() === action.text.toLowerCase())
        const oldCompletedStatus = oldGrocery?.isCompleted ?? false

        setTimeout(() => {
          dispatch({ type: 'sort-completed-below-uncompleted' })
        }, 2 * second)

        return {
          groceries: state.groceries.map(grocery => {
            const isGroceryToToggle = grocery === oldGrocery

            return isGroceryToToggle ? { ...grocery, isCompleted: !oldCompletedStatus } : grocery;
          })
        }

      case 'sort-completed-below-uncompleted':
        const uncompleted = state.groceries.filter(g => !g.isCompleted)
        const completed = state.groceries.filter(g => g.isCompleted)

        return {
          ...state,
          groceries: [ ...uncompleted, ...completed ]
        }

      default:
        return state;
    }
  }, initialState ?? getStateFromLocalStorage());

  useEffect(() => {
    // This also gets called on initial render, which ideally we'd want to skip since we persist the just-loaded list
    // of groceries from localStorage, back to localStorage again. Haven't found an intuitive way of skipping that tho.
    storeStateToLocaleStorage(state)
  }, [ state ]);

  const { groceries } = state;

  return (
    <div style={{ padding: 20 }}>
      <form onSubmit={(evt) => {
        evt.preventDefault()
        dispatch({ type: 'add', text: fieldText })
        setFieldText('')
        setAutoCompleteDropdownVisible(false)
      }}>
        <Autocomplete
          options={groceries.map(grocery => grocery.text)}
          open={isAutoCompleteDropdownVisible}
          onOpen={() => groceries.length > 0 && setAutoCompleteDropdownVisible(true)}
          onClose={() => setAutoCompleteDropdownVisible(false)}
          onInputChange={(_evt, newValue) => {
            const wasChangedProgrammatically = _evt == null
            if (wasChangedProgrammatically) return

            const wasOptionSelectedInDropdown = _evt.constructor.name !== 'SyntheticEvent'
            if (wasOptionSelectedInDropdown) {
              dispatch({ type: 'add', text: newValue })
              setFieldText('')
            } else {
              setFieldText(newValue)
            }
          }}
          style={{ minWidth: 300 }}
          inputValue={fieldText}
          renderInput={params => (
            <TextField {...params} label="Ny matvare.." variant="outlined" fullWidth />
          )}
        />
      </form>
      <main>
        <List>
          {groceries.map(grocery =>
            <ListItem key={grocery.text} button onClick={() => dispatch({ type: 'toggle', text: grocery.text })} data-testid="grocery" {...groceryLongPressProps}>
              <ListItemIcon>
                <Checkbox checked={grocery.isCompleted} color="primary" disableRipple />
              </ListItemIcon>
              <ListItemText primary={grocery.text} />

              {showDeleteIcons &&
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={() => dispatch({ type: 'delete', grocery })}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              }
            </ListItem>
          )}
        </List>
      </main>
    </div>
  );
}

export default App;
