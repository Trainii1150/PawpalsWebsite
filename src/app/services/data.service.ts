import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private apollo: Apollo) {}

  public fetchInitialData(uid: string | undefined): void {
    if (uid) {
      this.getTime(uid);
      this.getActivityData(uid);
      this.getStoreItems();
      this.getUserCoins(uid);
      this.getUserStorageItems(uid);
      this.getTimeByLanguage(uid);
      this.getUserDecorationItems(uid);
      this.getUserPets(uid);
      this.subscribeToTimeByLanguageUpdates();
      this.subscribeToPetFedUpdates();
    } else {
      console.error('User ID not found in cookies');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User ID token not found in cookies',
      });
    }
  }

  public getUserCoins(uid: string): any {
    return this.apollo.watchQuery({
      query: gql`
        query GetUserCoins($uid: String!) {
          userCoins(uid: $uid) {
            coins
          }
        }
      `,
      variables: { uid }
    }).valueChanges;
  }

  public getActivityData(uid: string): any {
    return this.apollo.watchQuery({
      query: gql`
        query GetActivity($uid: ID!) {
          activity(uid: $uid) {
            Languages
            wordcount
            coins
            time
            Timestamp
          }
        }
      `,
      variables: { uid }
    }).valueChanges;
  }

  public getStoreItems(): any {
    return this.apollo.watchQuery({
      query: gql`
        {
          storeItems {
            store_item_id
            item_id
            item_name
            description
            path
            price
            food_value
            created_at
          }
        }
      `
    }).valueChanges;
  }

  public getUserStorageItems(uid: string): any {
    return this.apollo.watchQuery({
      query: gql`
        query GetUserStorageItems($uid: ID!) {
          userStorageItems(uid: $uid) {
            storage_id
            item_name
            description
            path
            food_value
            created_at
            quantity 
          }
        }
      `,
      variables: { uid }
    }).valueChanges;
  }

  public getTimeByLanguage(uid: string): any {
    return this.apollo.watchQuery({
      query: gql`
        query GetTimeByLanguage($uid: String!) {
          timeByLanguage(uid: $uid) {
            language
            total_time
          }
        }
      `,
      variables: { uid }
    }).valueChanges;
  }

  public getUserDecorationItems(uid: string): any {
    return this.apollo.watchQuery({
      query: gql`
        query GetUserDecorationItems($uid: ID!) {
          getUserDecorationItems(uid: $uid) {
            pets {
              pet_id
              pet_name
              path
            }
            backgrounds {
              item_id
              item_name
              path
            }
          }
        }
      `,
      variables: { uid }
    }).valueChanges;
  }

  public getUserPets(uid: string): any {
    return this.apollo.watchQuery({
      query: gql`
        query GetUserPets($uid: String!) {
          userPets(uid: $uid) {
            pet_id
            pet_name
            hunger_level
            last_fed
            path
            exp
          }
        }
      `,
      variables: { uid }
    }).valueChanges;
  }

  private getTime(uid: string): void {
    this.apollo.watchQuery({
      query: gql`
        query GetTime($uid: String!) {
          time(uid: $uid)
        }
      `,
      variables: { uid }
    }).valueChanges.subscribe(
      (response: any) => {
        const timeInUnits = response.data.time / 10000;
        console.log(parseFloat(timeInUnits.toFixed(2)));
      },
      error => {
        console.error('Error getting today time:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to get today time: ${error.message}`,
        });
      }
    );
  }

  private subscribeToTimeByLanguageUpdates(): void {
    this.apollo.subscribe({
      query: gql`
        subscription OnTimeByLanguageUpdated {
          timeByLanguageUpdated {
            language
            total_time
          }
        }
      `
    }).subscribe((result: any) => {
      console.log(result.data.timeByLanguageUpdated);
    });
  }

  private subscribeToPetFedUpdates(): void {
    this.apollo.subscribe({
      query: gql`
        subscription OnPetFed {
          petFed {
            pet_id
            hunger_level
          }
        }
      `
    }).subscribe((result: any) => {
      if (result.data && result.data.petFed) {
        const updatedPet = result.data.petFed;
        console.log('Real-time update:', updatedPet);
        this.updateHungerLevel(updatedPet.pet_id, updatedPet.hunger_level);
      } else {
        console.error('No data received from subscription');
      }
    }, error => {
      console.error('Error during subscription:', error);
    });
  }

  private updateHungerLevel(petId: number, hungerLevel: number): void {
    console.log(`Updating hunger level for pet ${petId} to ${hungerLevel}`);
  }
}
