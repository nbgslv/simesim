import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import AdvantagePoints from '../../../components/AdvantagePoints/AdvantagePoints';

describe('AdvantagePoints', () => {
  it('matches snapshot', () => {
    const { container } = render(<AdvantagePoints />);
    expect(container).toMatchSnapshot();
  });

  it('displays message when mouse is over first column', () => {
    const { getByText, getByTestId } = render(<AdvantagePoints />);
    const firstColumn = getByTestId('first-column');
    fireEvent.mouseEnter(firstColumn);
    expect(
      getByText('רכשתם חבילה והטלפון לא תומך? קבלו החזר כספי בלי שאלות')
    ).toBeInTheDocument();
  });

  it('hides message when mouse leaves first column', () => {
    const { getByTestId, queryByText } = render(<AdvantagePoints />);
    const secondColumn = getByTestId('first-column');
    fireEvent.mouseEnter(secondColumn);
    fireEvent.mouseLeave(secondColumn);
    expect(
      queryByText('רכשתם חבילה והטלפון לא תומך? קבלו החזר כספי בלי שאלות')
    ).not.toBeInTheDocument();
  });

  it('displays message when mouse is over second column', () => {
    const { getByText, getByTestId } = render(<AdvantagePoints />);
    const firstColumn = getByTestId('second-column');
    fireEvent.mouseEnter(firstColumn);
    expect(
      getByText(
        'כל הפרטים באתר מוצפנים ומועברים בצורה מאובטחת בטכנולוגיית SSL. כל עסקאות האשראי מאובטחות בתקן PCI המתקדם'
      )
    ).toBeInTheDocument();
  });

  it('hides message when mouse leaves second column', () => {
    const { getByTestId, queryByText } = render(<AdvantagePoints />);
    const secondColumn = getByTestId('second-column');
    fireEvent.mouseEnter(secondColumn);
    fireEvent.mouseLeave(secondColumn);
    expect(
      queryByText(
        'כל הפרטים באתר מוצפנים ומועברים בצורה מאובטחת בטכנולוגיית SSL. כל עסקאות האשראי מאובטחות בתקן PCI המתקדם'
      )
    ).not.toBeInTheDocument();
  });

  it('displays message when mouse is over third column', () => {
    const { getByText, getByTestId } = render(<AdvantagePoints />);
    const firstColumn = getByTestId('third-column');
    fireEvent.mouseEnter(firstColumn);
    expect(
      getByText(
        'מגוון חבילות חו"ל רחב במחירים הנמוכים ביותר; יותר מ-100 מדינות נתמכות; מעבר בין מדינות בלי להחליף eSim!'
      )
    ).toBeInTheDocument();
  });

  it('hides message when mouse leaves third column', () => {
    const { getByTestId, queryByText } = render(<AdvantagePoints />);
    const secondColumn = getByTestId('third-column');
    fireEvent.mouseEnter(secondColumn);
    fireEvent.mouseLeave(secondColumn);
    expect(
      queryByText(
        'מגוון חבילות חו"ל רחב במחירים הנמוכים ביותר; יותר מ-100 מדינות נתמכות; מעבר בין מדינות בלי להחליף eSim!'
      )
    ).not.toBeInTheDocument();
  });

  it('displays message when mouse is over fourth column', () => {
    const { getByText, getByTestId } = render(<AdvantagePoints />);
    const firstColumn = getByTestId('fourth-column');
    fireEvent.mouseEnter(firstColumn);
    expect(
      getByText("גישה לחבילות ותמיכה בוואצאפ, בצ'אט ובטלפון מסביב לשעון")
    ).toBeInTheDocument();
  });

  it('hides message when mouse leaves fourth column', () => {
    const { getByTestId, queryByText } = render(<AdvantagePoints />);
    const secondColumn = getByTestId('fourth-column');
    fireEvent.mouseEnter(secondColumn);
    fireEvent.mouseLeave(secondColumn);
    expect(
      queryByText("גישה לחבילות ותמיכה בוואצאפ, בצ'אט ובטלפון מסביב לשעון")
    ).not.toBeInTheDocument();
  });
});
