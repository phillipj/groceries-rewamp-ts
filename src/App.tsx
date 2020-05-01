import React, { useReducer, useEffect, useState } from 'react';
import Select from 'react-select/creatable';
import {
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Container
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import CssBaseline from '@material-ui/core/CssBaseline';

type Grocery = {
  text: string;
  completed: boolean;
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
  const [ showDeleteIcons, setShowDeleteIcons ] = useState(() => false)

  const [ state, dispatch ] = useReducer((state: State, action: Action) => {
    switch (action.type) {
      case 'add':
        const toBeAdded = action.text.trim()
        const otherGroceries = state.groceries.filter(grocery => grocery.text.toLowerCase() !== toBeAdded.toLowerCase())

        return {
          groceries: [
            { text: toBeAdded, completed: false },
            ...otherGroceries,
          ]
        };

      case 'delete':
        return {
          groceries: state.groceries.filter(grocery => grocery !== action.grocery)
        };

      case 'toggle':
        const oldGrocery = state.groceries.find(grocery => grocery.text.toLowerCase() === action.text.toLowerCase())
        const oldCompletedStatus = oldGrocery?.completed ?? false

        setTimeout(() => {
          dispatch({ type: 'sort-completed-below-uncompleted' })
        }, 2 * second)

        return {
          groceries: state.groceries.map(grocery => {
            const isGroceryToToggle = grocery === oldGrocery

            return isGroceryToToggle ? { ...grocery, completed: !oldCompletedStatus } : grocery;
          })
        }

      case 'sort-completed-below-uncompleted':
        const uncompleted = state.groceries.filter(g => !g.completed)
        const completed = state.groceries.filter(g => g.completed)

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
    <Container style={{ marginTop: 20 }}>
      <CssBaseline />
      <div>
        <header style={{ display: "flex", justifyItems: "flex-end", alignItems: "center" }}>
          <form onSubmit={(evt) => evt.preventDefault()} style={{ flexGrow: 1 }}>
            <Select
              options={groceries.map(({text}) => ({
                value: text, label: text
              }))}
              onChange={(option) => {
                if (option == null) return

                // something fishy with the TypeScript defs enforces a check to ensure the `.value` field is indeed present before using it
                "value" in option && dispatch({ type: 'add', text: option.value })
              }}
              styles={{
                container: (provided) => ({
                  ...provided,
                  fontSize: '1rem'
                })
              }}
              placeholder="Ny matvare.."
              formatCreateLabel={(value) => `Legg til "${value}"`}
              value={null}
              blurInputOnSelect={false}
              isSearchable
              isClearable
            />
          </form>

          <Button onClick={() => setShowDeleteIcons(!showDeleteIcons)} style={{ paddingLeft: 10 }}>
            {showDeleteIcons ? "Done" : "Edit"}
          </Button>
        </header>
        <main>
          <List>
            {groceries.map(grocery =>
              <ListItem key={grocery.text} button onClick={() => dispatch({ type: 'toggle', text: grocery.text })} data-testid="grocery">
                <ListItemIcon>
                  <Checkbox checked={grocery.completed} color="primary" disableRipple  />
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
    </Container>
  );
}

export default App;
