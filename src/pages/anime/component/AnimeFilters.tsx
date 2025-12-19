import Filter from './filters/Filter';
import Kind from './filters/Kind';
import Sorts from './filters/Sorts';

export default function AnimeFilters({filters, setFilters}) {
    return (
        <div>
            <Filter title={'Sort BY'} storageKey='sort'>
                <Sorts sort={filters?.sort ?? "updated_at:desc"} setFilters={setFilters} />
            </Filter>
            <Filter title={'Type'} storageKey='type'>
                <Kind />
            </Filter>
        </div>
    );
}
