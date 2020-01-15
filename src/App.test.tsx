import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import App from './App'

function submitGrocery(groceryText: string, labelToClick: Element) {
  fireEvent.click(labelToClick)

  const focusedElement = document.activeElement || document.body

  fireEvent.change(focusedElement, { target: { value: groceryText } })
  fireEvent.submit(focusedElement)
}

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

test('latest grocery added is rendered first in the list', () => {
  const { getAllByTestId, getByLabelText } = render(<App />)

  submitGrocery('Gulrot', getByLabelText('Ny matvare..'))
  submitGrocery('Brokkoli ', getByLabelText('Ny matvare..'))

  const groceries = getAllByTestId('grocery').map(grocery => grocery.textContent)
  expect(groceries).toEqual(['Brokkoli', 'Gulrot'])
})
