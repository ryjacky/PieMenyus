import {Component, Input, TemplateRef} from '@angular/core';
import {db, Profile} from '../../../../app/src/preferences/AHPDB';
import {NbDialogService, NbPosition} from '@nebular/theme';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss']
})
export class ProfileEditorComponent {
  @Input() profile: Profile = {id: 0, enabled: false, exePath: '', iconBase64: '', name: '', pieMenus: []};

  profSettingsRevealed = false;

  color: any;

  constructor(private dialogService: NbDialogService) {
  }

  newPieMenu() {
    this.profSettingsRevealed = false;

    db.pieMenu.add({
      activationMode: '',
      escapeRadius: 0,
      hotkey: '',
      name: 'New Pie Menu',
      openInScreenCenter: false,
      pieItems: [],
      selectionColor: '',
      enabled: true
    })
      .then((pieMenuId) => {
        this.addPieMenu(pieMenuId as number);
      });

    console.log('ProfileEditorComponent.addPieMenu(): this.profile.pieMenus = ' + this.profile.pieMenus);
  }

  onPieMenuChanged(event: { remove: number | undefined; add: number | undefined }) {
    console.log('ProfileEditorComponent.removePieMenuFromProf(): event = ' + event);

    let newPieMenuList = this.profile.pieMenus;
    if (event.remove !== undefined) {
      newPieMenuList = newPieMenuList.filter((pieMenuId) => pieMenuId !== event.remove);
    }
    if (event.add !== undefined) {
      newPieMenuList = [...newPieMenuList, event.add];
    }

    if (event.remove !== undefined || event.add !== undefined) {
      db.profile.update(
        this.profile.id ?? 0,
        {pieMenus: newPieMenuList})
        .then(() => {
          this.profile.pieMenus = newPieMenuList;
        });
    }

  }

  updateProfile() {
    db.profile.update(this.profile.id ?? 0, this.profile);

    console.log('ProfileEditorComponent.updateProfile(): this.profile = ' + this.profile);
  }

  openPieMenuSelector(pieMenuSelectorDialog: TemplateRef<any>) {
    this.dialogService.open(pieMenuSelectorDialog, {
      context: db.pieMenu.where('id').noneOf(this.profile.pieMenus).toArray(),
    });
  }

  protected readonly NbPosition = NbPosition;

  addPieMenu(id: number) {
    if (this.profile.pieMenus.includes(id)) {
      return;
    }
    db.profile.update(this.profile, {pieMenus: [...this.profile.pieMenus, id]});
  }
}

