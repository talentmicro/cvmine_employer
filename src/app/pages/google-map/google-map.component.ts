import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { GoogleMapsModule } from '@angular/google-maps';
// import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-google-map',
  standalone: true,
  imports: [
    CommonModule, GoogleMapsModule
  ],
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'] 
})
export class GoogleMapComponent 
// implements OnInit 
{
  @Input() latLngSubject!: Subject<{ lat: number, lng: number }>;
  @Input() markersArray: { title: string, lat: number, lng: number }[] = [];
  @Input() isCardShow!:boolean;
  @Output() addressChange = new EventEmitter<any>();

  map!: google.maps.Map;
  infoWindow!: google.maps.InfoWindow;
  marker!: google.maps.Marker;
  markers: google.maps.Marker[] = [];
  markerAddressArray: { title: string, lat: number, lng: number, address: string }[] = [];
  lat!: number;
  lng!: number;
  address: string = '';
  city: string = '';
  state: string = '';
  pincode: string = '';
  address1: string = '';
  address2: string = '';
  country: string = '';
  loading: boolean = false;

  ngOnInit(): void {
    this.getCurrentLoc();
    this.latLngSubject.subscribe(coords => {
      this.lat = coords.lat;
      this.lng = coords.lng;
      this.placeMarkerAndPanTo(new google.maps.LatLng(this.lat, this.lng));
    });

    this.addMultipleMarkers();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {

    const mapDiv = document.getElementById('map');
    if (!mapDiv) {
      console.log('Map div not found');
    }

    this.map = new google.maps.Map(mapDiv as HTMLElement, {
      center: { lat: 12.971599, lng: 77.594566 },
      zoom: 19,
      mapTypeControl: true,
    });

    this.infoWindow = new google.maps.InfoWindow();

    const input = document.getElementById('autocomplete') as HTMLInputElement;
    if (!input) {
      console.error('Autocomplete input element not found!');
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', () => {
      const place:any = autocomplete.getPlace();

      if (place.geometry) {
        this.placeMarkerAndPanTo(place.geometry.location);
        this.getAddress(place.geometry.location.lat(), place.geometry.location.lng());
      }
    });

    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        this.placeMarkerAndPanTo(event.latLng);
        this.getAddress(event.latLng.lat(), event.latLng.lng());
      }
    });
  }

  getCurrentLoc() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          this.lat = pos.lat;
          this.lng = pos.lng;

          this.placeMarkerAndPanTo(new google.maps.LatLng(pos.lat, pos.lng));
          this.getAddress(pos.lat, pos.lng);
        },
        () => {
          this.handleLocationError(true, this.infoWindow, this.map.getCenter()!);
        }
      );
    } else {
      this.handleLocationError(false, this.infoWindow, this.map.getCenter()!);
    }
  }

  placeMarkerAndPanTo(latLng: google.maps.LatLng) {
    this.lat = latLng.lat();
    this.lng = latLng.lng();

    const redPinIcon = {
      url: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20512%20512%22%20style%3D%22enable-background%3Anew%200%200%20512%20512%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20style%3D%22fill%3A%23e6e6e6%22%20d%3D%22m286.378%20211.608-3.972%2037.7L256%20499.819l-26.417-250.511-3.972-37.7z%22/%3E%3Ccircle%20style%3D%22fill%3A%23f95428%22%20cx%3D%22256.006%22%20cy%3D%22114.203%22%20r%3D%22102.017%22/%3E%3Cpath%20style%3D%22fill%3A%23e54728%22%20d%3D%22M294.383%20177.829c-56.341%200-102.013-45.673-102.013-102.013%200-18.311%204.849-35.479%2013.296-50.336-30.854%2017.543-51.678%2050.688-51.678%2088.718%200%2056.341%2045.673%20102.013%20102.013%20102.013%2038.03%200%2071.174-20.825%2088.718-51.678-14.856%208.449-32.025%2013.296-50.336%2013.296z%22/%3E%3Cpath%20style%3D%22fill%3A%23b3b3b3%22%20d%3D%22m286.378%20211.608-3.972%2037.702c-8.42%202.266-17.267%203.461-26.406%203.461s-17.998-1.206-26.418-3.461l-3.972-37.702h60.768z%22/%3E%3Cpath%20style%3D%22fill%3A%23333%22%20d%3D%22M370.199%20114.199C370.199%2051.229%20318.97%200%20256%200S141.801%2051.229%20141.801%20114.199c0%2048.26%2030.091%2089.622%2072.495%20106.314l29.579%20280.579a12.186%2012.186%200%200%200%2024.237%200l29.579-280.575c42.412-16.69%2072.508-58.055%2072.508-106.318zM255.996%20383.587%20239.51%20227.203a114.708%20114.708%200%200%200%2016.491%201.195c5.597%200%2011.097-.412%2016.481-1.193l-16.486%20156.382zm.004-179.56c-49.53%200-89.828-40.296-89.828-89.828S206.47%2024.371%20256%2024.371s89.828%2040.296%2089.828%2089.828-40.296%2089.828-89.828%2089.828z%22/%3E%3Cellipse%20transform%3D%22rotate(-134.999%20293.699%2078.6)%22%20style%3D%22fill%3A%23f47c6c%22%20cx%3D%22293.697%22%20cy%3D%2278.6%22%20rx%3D%2237.113%22%20ry%3D%2225.87%22/%3E%3C/svg%3E',
      scaledSize: new google.maps.Size(50, 55),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(25, 55)
    };

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        title: 'Clicked Location',
        draggable: true,
        icon: redPinIcon
      });
    } else {
      this.marker.setPosition(latLng);
    }

    this.marker.addListener('dragend', () => {
      const newPos = this.marker.getPosition();
      if (newPos) {
        this.lat = newPos.lat();
        this.lng = newPos.lng();
        this.map.panTo(newPos);
        this.getAddress(newPos.lat(), newPos.lng());
      }
    });

    this.map.panTo(latLng);
  }

  getAddress(lat: number, lng: number) {
    this.loading = true;

    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results:any, status) => {
      this.loading = false;
      if (status === 'OK') {
        if (results[0]) {
          const addressComponents = results[0].address_components;
          this.address = results[0].formatted_address;
          const street_number = this.getComponent(addressComponents, 'street_number') || '';
          const route = this.getComponent(addressComponents, 'route') || '';
          const subroute = this.getComponent(addressComponents, 'sublocality') || '';
          const sub_locality_level2 = this.getComponent(addressComponents, 'sublocality_level_2') || '';
          const sub_locality_level1 = this.getComponent(addressComponents, 'sublocality_level_1') || '';
          const locality = this.getComponent(addressComponents, 'locality') || '';
          const administrative_area_level_1 = this.getComponent(addressComponents, 'administrative_area_level_1') || '';
          this.city = this.getComponent(addressComponents, 'locality') || '';
          this.state = this.getComponent(addressComponents, 'administrative_area_level_1') || '';
          this.pincode = this.getComponent(addressComponents, 'postal_code') || '';
          this.country = this.getComponent(addressComponents, 'country') || '';

          this.address1 = `${street_number}, ${route}, ${subroute}`;
          this.address2 = `${sub_locality_level2}, ${sub_locality_level1}, ${locality}, ${administrative_area_level_1}`;

          this.addressChange.emit({
            address: this.address,
            address1: this.address1,
            address2: this.address2,
            city: this.city,
            state: this.state,
            pincode: this.pincode,
            country: this.country
          });
        } else {
          this.address = 'No results found';
          this.city = '';
          this.state = '';
          this.pincode = '';
        }
      } else {
        this.address = 'Geocoder failed due to: ' + status;
        this.city = '';
        this.state = '';
        this.pincode = '';
      }
    });
  }

  addMultipleMarkers(): void {
    this.clearMarkers();

    this.markerAddressArray = [];

    this.markersArray.forEach(coord => {
      const marker = new google.maps.Marker({
        position: { lat: coord.lat, lng: coord.lng },
        map: this.map,
        title: coord.title,
        draggable: false
      });

      this.markers.push(marker);

      this.fetchAndSetMarkerAddress(marker, coord.lat, coord.lng, coord.title);
    });
  }

  fetchAndSetMarkerAddress(marker: google.maps.Marker, lat: number, lng: number, title: string): void {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results:any, status) => {
      if (status === 'OK') {
        if (results[0]) {
          const address = results[0].formatted_address;
          marker.setTitle(address);

          this.markerAddressArray.push({
            title,
            lat,
            lng,
            address
          });
        } else {
          marker.setTitle('No address found');

          this.markerAddressArray.push({
            title,
            lat,
            lng,
            address: 'No address found'
          });
        }
      } else {
        marker.setTitle('Geocoder failed');

        this.markerAddressArray.push({
          title,
          lat,
          lng,
          address: 'Geocoder failed'
        });
      }
    });
  }

  clearMarkers(): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  getComponent(components: google.maps.GeocoderAddressComponent[], type: string): string | undefined {
    const component = components.find(comp => comp.types.includes(type));
    return component?.long_name || component?.short_name;
  }

  handleLocationError(browserHasGeolocation: boolean, infoWindow: google.maps.InfoWindow, pos: google.maps.LatLng) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? 'Error: The Geolocation service failed.'
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(this.map);
  }

  recenterMap() {
    this.getCurrentLoc();
  }

  focusLocation(title: string) {
    
    const markerAddress = this.markerAddressArray.find(marker => marker.title === title);

    
    if (markerAddress) {
      
      const position = new google.maps.LatLng(markerAddress.lat, markerAddress.lng);
      this.map.panTo(position);
      this.map.setZoom(19);
    } else {
      console.log('Marker with the specified title not found');
    }
  }
}
