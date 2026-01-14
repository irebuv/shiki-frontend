export default function Kind() {
    const sortBy = [
        {
            name: 'TV Series',
            value: 'series',
        },
        {
            name: 'Movie',
            value: 'movie',
        },
        {
            name: 'OVA',
            value: 'ova',
        },
        {
            name: 'ONA',
            value: 'ona',
        },
    ];

    return (
        <ul>
            {sortBy.map((el) => {
                return (
                    <li key={el.name} className={`p-1 hover:bg-input cursor-pointer`}>
                        {el.name}
                    </li>
                );
            })}
        </ul>
    );
}
