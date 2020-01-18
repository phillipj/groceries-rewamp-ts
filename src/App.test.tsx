import React from 'react'
import { act, fireEvent, render, getByAltText } from '@testing-library/react'
import App from './App'

jest.useFakeTimers();

function submitGrocery(groceryText: string, labelToClick: Element) {
  fireEvent.click(labelToClick)

  const focusedElement = document.activeElement || document.body

  fireEvent.change(focusedElement, { target: { value: groceryText } })
  fireEvent.submit(focusedElement)
}

describe('adding groceries', () => {
  test('text filled in and submitted should be rendered as a grocery afterwards', () => {
    const { getByText, getByLabelText } = render(<App />)

    submitGrocery('Gulrot', getByLabelText('Ny matvare..'))

    expect(getByText('Gulrot')).toBeInTheDocument()
  })

  test('submitting the same grocery several times should only result in one grocery rendered', () => {
    const { getAllByText, getByLabelText } = render(<App />)

    submitGrocery('Gulrot', getByLabelText('Ny matvare..'))
    submitGrocery('Gulrot', getByLabelText('Ny matvare..'))

    expect(getAllByText('Gulrot')).toHaveLength(1)
  })

  test('submitting the same grocery only different by whitespace should result in only one grocery rendered', () => {
    const { queryAllByText, getByLabelText } = render(<App />)

    submitGrocery('Gulrot', getByLabelText('Ny matvare..'))
    submitGrocery('Gulrot ', getByLabelText('Ny matvare..'))

    expect(queryAllByText('Gulrot')).toHaveLength(1)
  })
})

describe('sorting', () => {
  test('latest grocery added is rendered first in the list', () => {
    const { getAllByTestId, getByLabelText } = render(<App />)

    submitGrocery('Gulrot', getByLabelText('Ny matvare..'))
    submitGrocery('Brokkoli ', getByLabelText('Ny matvare..'))

    const groceries = getAllByTestId('grocery').map(grocery => grocery.textContent)
    expect(groceries).toEqual(['Brokkoli', 'Gulrot'])
  })

  test('clicking a grocery to mark it as complete moves the grocery below all uncompleted groceries after a while', () => {
    const { getAllByTestId, getByLabelText } = render(<App />)

    submitGrocery('Gulrot', getByLabelText('Ny matvare..'))
    submitGrocery('Brokkoli ', getByLabelText('Ny matvare..'))

    const firstGrocery = getAllByTestId('grocery')[0]

    fireEvent.click(firstGrocery)

    // act() is needed whenever code gets executed that causes state changes, probably only if
    // we're not using testing-library functions, since those functions should know for themselfs
    // when state changes might occur
    act(() => {
      jest.runAllTimers()
    })

    const groceries = getAllByTestId('grocery').map(grocery => grocery.textContent)
    expect(groceries).toEqual(['Gulrot', 'Brokkoli'])
  })
})

describe('deleting groceries', () => {

  function longPress(element: HTMLElement) {
    fireEvent.mouseDown(element)

    // act() is needed whenever code gets executed that causes state changes, probably only if
    // we're not using testing-library functions, since those functions should know for themselfs
    // when state changes might occur
    act(() => {
      jest.runAllTimers()
    })
  }

  test('long pressing a grocery should make delete button appear after a while', () => {
    const { getByTestId, getByLabelText } = render(<App initialState={{ groceries: [] }} />)

    submitGrocery('Gulrot', getByLabelText('Ny matvare..'))
    longPress(getByTestId('grocery'))

    expect(getByLabelText('delete')).toBeVisible()
  })

  test('clicking the delete button removes the grocery from the list', () => {
    const { getByTestId, getByLabelText, queryByText } = render(<App initialState={{ groceries: [] }} />)

    submitGrocery('Gulrot', getByLabelText('Ny matvare..'))
    longPress(getByTestId('grocery'))

    fireEvent.click(getByLabelText('delete'))

    expect(queryByText('Gulrot')).not.toBeInTheDocument()
  })
})
