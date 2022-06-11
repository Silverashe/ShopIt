import React,{ Fragment, useEffect } from 'react';
import MetaData from './layouts/MetaData';

import {useDispatch, useSelector} from 'react-redux';
import Product from './product/Product'
import Laoder from './layouts/Loader'

import { getProducts } from '../actions/productActions';
import '../App.css'
import Loader from './layouts/Loader';

const Home = () => {

        const dispatch = useDispatch();
        const { loading, products, error, productsCount }  = useSelector(state => state.product);
        useEffect(() => {
            
          dispatch(getProducts());
        }, [dispatch]);

        
  return (

    <Fragment>
        {loading ? <Loader/> :(
          <Fragment>
            <MetaData title={'Buy Best Product Online'}/>
      
            <h1 id="products_heading">Latest Products</h1>
    
            <section id="products" className="container mt-5">
                <div className="row">
    
                    {products && products.map( product => (
                          <Product key={product._id} product={product}></Product>
                    ))}
                  
                </div>
            </section>
          </Fragment>
        )}
        

       


    </Fragment>
  );
};

export default Home;
