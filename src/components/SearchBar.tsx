import React from 'react'
import Form from "next/form";

import { SearchSlash } from 'lucide-react';
import { Button } from './ui/button';

const SearchBar = () => {
  return (
    <div>
     <Form action={"/search"} className='relative'>
     <input
     type="text"
     name='q'//query
     placeholder='Search for  Events🎬...'
     className='w-full py-3 px-4 pl-12 bg-white rounded-xl  border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'

     />
     <SearchSlash className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5'/>
     <Button type='submit'
      className='absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600  text=white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700  transition-colors duration-200'
     > Search
        </Button>
        </Form> 
    </div>
  )
}

export default SearchBar
