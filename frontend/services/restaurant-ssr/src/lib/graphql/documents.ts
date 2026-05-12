import { gql } from "@apollo/client";

export const CATALOG_ITEMS_LIST = gql`
  query CatalogItemsList($filters: CatalogItemFiltersInput) {
    catalogItems(filters: $filters) {
      id
      name
      description
      city
      restaurantId
      restaurantName
      priceLabel
      images
      rating
      category
    }
  }
`;

export const RESTAURANTS_LIST = gql`
  query RestaurantsList($filters: RestaurantFiltersInput) {
    restaurants(filters: $filters) {
      id
      name
      published
      preview {
        images
        rating
        description
        city
        address
        bookHref
        deliveryHref
      }
    }
  }
`;

export const RESTAURANT_DETAIL = gql`
  query RestaurantDetail($id: ID!) {
    restaurant(id: $id) {
      id
      name
      published
      preview {
        images
        rating
        description
        city
        address
        bookHref
        deliveryHref
      }
      mainSections {
        id
        title
        divisions {
          id
          title
          blocks {
            id
            title
            subtitle
            extraText
            image
          }
        }
      }
    }
  }
`;
