/**
 * EditPostPresenter
 * Orchestrates edit-post data flow with repositories
 */

import { IPetPostRepository } from "@/application/repositories/IPetPostRepository";
import { IPetTypeRepository } from "@/application/repositories/IPetTypeRepository";
import { PetPost, PetType } from "@/domain/entities/pet-post";

export interface EditPostViewModel {
  post: PetPost;
  petTypes: PetType[];
  loading: boolean;
  error: string | null;
}

export class EditPostPresenter {
  private _post: PetPost | null = null;
  private _petTypes: PetType[] = [];
  private _loading = false;
  private _error: string | null = null;

  constructor(
    private petPostRepository: IPetPostRepository,
    private petTypeRepository: IPetTypeRepository,
  ) {}

  async loadPost(id: string): Promise<PetPost | null> {
    this._loading = true;
    this._error = null;
    try {
      const post = await this.petPostRepository.getById(id);
      this._post = post;
      return post;
    } catch (err) {
      this._error = err instanceof Error ? err.message : "Failed to load post";
      return null;
    } finally {
      this._loading = false;
    }
  }

  async loadPetTypes(): Promise<PetType[]> {
    this._loading = true;
    try {
      const types = await this.petTypeRepository.getAll();
      this._petTypes = types;
      return types;
    } catch (err) {
      this._error = err instanceof Error ? err.message : "Failed to load pet types";
      return [];
    } finally {
      this._loading = false;
    }
  }

  get viewModel(): EditPostViewModel {
    return {
      post: this._post!,
      petTypes: this._petTypes,
      loading: this._loading,
      error: this._error,
    };
  }
}
