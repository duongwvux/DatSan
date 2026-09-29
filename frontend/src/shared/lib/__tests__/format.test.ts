import { formatTimeRange, formatVnd, formatVndShort } from '../format'

describe('format', () => {
  it('định dạng tiền VND', () => {
    expect(formatVnd(120000).replace(/\s/g, ' ')).toBe('120.000 ₫')
  })

  it('rút gọn giá', () => {
    expect(formatVndShort(80000)).toBe('80k')
    expect(formatVndShort(1500000)).toBe('1.5tr')
    expect(formatVndShort(2000000)).toBe('2tr')
  })

  it('hiển thị khoảng giờ theo múi giờ Việt Nam', () => {
    expect(formatTimeRange('2026-10-01T11:00:00Z', '2026-10-01T12:00:00Z')).toMatch(/^18:00–19:00/)
  })
})
