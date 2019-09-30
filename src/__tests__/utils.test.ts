// test('deepReplace', () => {
//     const replaceDayjsWithDate = deepConvert<Dayjs, Date>(isDayjs, value =>
//         value.toDate(),
//     )

//     const date = dayjs()

//     const original = {
//         key: 'value',
//         date,
//         child: { key: 'value', date },
//     }

//     const replaced = replaceDayjsWithDate(original)

//     expectType<{
//         key: string
//         date: Date
//         child: { key: string; date: Date }
//     }>(replaced)

//     expect(replaced).toEqual({
//         key: 'value',
//         date: date.toDate(),
//         child: { key: 'value', date: date.toDate() },
//     })
// })
