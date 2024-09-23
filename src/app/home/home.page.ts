import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  InfiniteScrollCustomEvent,
  IonList,
  IonItem,
  IonSkeletonText,
  IonAvatar,
  IonAlert,
  IonLabel,
  IonBadge,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { MovieService } from '../service/movie.service';
import { catchError, finalize } from 'rxjs';
import { MovieResult } from '../service/interfaces';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonSearchbar,
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonBadge,
    IonLabel,
    IonAlert,
    IonAvatar,
    IonSkeletonText,
    IonItem,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    DatePipe,
    RouterModule,
  ],
})
export class HomePage {
  private movieService = inject(MovieService);
  private currentPage = 1;
  public error = null;
  public movie: MovieResult[] = [];
  public isLoading = false;
  public imageBaseUrl = 'https://image.tmdb.org/t/p';
  public dummyArray = new Array(5);
  public searchTerm = '';
  constructor() {
    this.loadMovies();
  }

  loadMovies(event?: InfiniteScrollCustomEvent) {
    this.error = null;
    this.isLoading = false;

    if (!event) {
      this.isLoading = true;
    }

    const movieRequest = this.searchTerm
      ? this.movieService.getMovieBySearch(this.searchTerm, this.currentPage)
      : this.movieService.getTopRatedMovies(this.currentPage);

    movieRequest
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (event) {
            event.target.complete();
          }
        }),
        catchError((err: any) => {
          console.log(err);
          this.error = err.error.status_message;
          return [];
        })
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.movie.push(...res.results);

          if (event) {
            event.target.disabled = res.total_pages === this.currentPage;
          }
        },
      });
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    this.currentPage++;
    this.loadMovies(event);
  }

  // Handle search term input
  OnSearch(event: any) {
    this.searchTerm = event.target.value.trim();
    this.currentPage = 1;
    this.movie = [];
    this.loadMovies();
  }
}
