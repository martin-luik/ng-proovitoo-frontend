import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { Shell } from './shell';
import {TranslateModule} from '@ngx-translate/core';
import {AuthService} from '../services/auth.service';

@Component({ standalone: true, template: '' })
class DummyPage {}

describe('Layout Shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Shell,
        DummyPage,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([{ path: '', component: DummyPage }]),
        provideLocationMocks(),
        { provide: AuthService, useValue: { isLoggedIn: () => false } }
      ],
    }).compileComponents();
  });

  it('should render nav with key "brandTitle"', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('brandTitle');
  });

  it('should render nav with key "nav.events"', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('nav.events');
  });

  it('should render nav with key "nav.admin"', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('nav.admin');
  });

  it('should render nav with key "nav.dashboard" when logged IN', () => {
    TestBed.overrideProvider(AuthService, { useValue: { isLoggedIn: () => true } });
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('nav.dashboard');
  });

  it('should render nav with key "nav.logout" when logged IN', () => {
    TestBed.overrideProvider(AuthService, { useValue: { isLoggedIn: () => true } });
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('nav.logOut');
  });
});
